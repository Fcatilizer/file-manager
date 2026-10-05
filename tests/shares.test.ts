import assert from 'node:assert/strict'
import { after, beforeEach, mock, test } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import cookieParser from 'cookie-parser'
import { S3Client } from '@aws-sdk/client-s3'
import { createShareRouters, type ShareRecord, type ShareStore } from '../server/shares.ts'
import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
import type { AuthedRequest } from '../server/auth.ts'

const records = new Map<string, ShareRecord>()
const store: ShareStore = {
  async insert(record) { records.set(record._id, record) },
  async findToken(hash) { return [...records.values()].find((s) => s.tokenHash === hash) || null },
  async list(ownerId, bucket, key) { return [...records.values()].filter((s) => s.ownerId === ownerId && s.bucket === bucket && s.key === key && !s.revoked) },
  async revoke(id, ownerId) { const s = records.get(id); if (s?.ownerId === ownerId) s.revoked = true },
}
const buckets = new MemoryBucketStore()
const calls: {name:string; input: Record<string, unknown>}[] = []
const stub = mock.method(S3Client.prototype, 'send', async command => {
  calls.push({name:command.constructor.name,input:command.input})
  return command.constructor.name === 'ListObjectsV2Command' ? { Contents: [{Key:'photos/a.jpg'}], CommonPrefixes:[{Prefix:'photos/nested/'}], IsTruncated:true, NextContinuationToken:'next-page' } : {}
})
const s3 = new S3Client({region:'us-east-1',endpoint:'http://localhost:9000',forcePathStyle:true,credentials:{accessKeyId:'test',secretAccessKey:'test'}})
const routes = createShareRouters(s3, new BucketProtection(buckets), store)
const app = express(); app.use(cookieParser()); app.use('/api/public', routes.publicRouter)
app.use('/api/shares', (req: AuthedRequest,res,next) => {
  const id=req.headers['x-user'] as string
  if(!id) {res.sendStatus(401);return}
  req.user={id,email:`${id}@example.com`,role:id==='admin'?'admin':'user'};next()
}, routes.management)
const server=app.listen(0,'127.0.0.1'); await once(server,'listening')
const addr=server.address(); if(!addr || typeof addr==='string') throw Error('Missing address')
const base=`http://127.0.0.1:${addr.port}`
async function request(path:string,method='GET',body?:unknown,user='owner') { return fetch(base+path,{method,redirect:'manual',headers:{'Content-Type':'application/json','x-user':user,Cookie:'vault_session=test'},body:body===undefined?undefined:JSON.stringify(body)}) }
async function create(extra:Record<string,unknown>={}) { const res=await request('/api/shares','POST',{bucket:'shared',key:'photos/a.jpg',folder:false,duration:'1h',...extra}); assert.equal(res.status,201);return res.json() }
beforeEach(()=>{records.clear();buckets.buckets.clear();calls.length=0})
after(async()=>{stub.mock.restore();await new Promise<void>(resolve=>server.close(()=>resolve()))})

test('creates opaque random links, stores only hashes, and opens without login',async()=>{
 const a=await create(),b=await create()
 assert.match(a.path,/^\/api\/public\/[A-Za-z0-9_-]{43}$/);assert.notEqual(a.path,b.path)
 assert.ok(!JSON.stringify([...records.values()]).includes(a.path.split('/').pop()))
 const res=await request(a.path,'GET',undefined,'');assert.equal(res.status,200)
 assert.equal(res.headers.get('Referrer-Policy'),'no-referrer');assert.match(await res.text(),/Download file/)
 assert.equal((await request('/api/shares','POST',{},'')).status,401)
})
test('supports presets, custom duration and permanent links; rejects invalid expiry',async()=>{
 for(const [duration,hours] of [['1h',1],['6h',6],['24h',24],['custom',2.5]] as const){const s=await create({duration,customHours:2.5});assert.ok(Math.abs(new Date(s.expiresAt).getTime()-Date.now()-hours*3600000)<2000)}
 assert.equal((await create({duration:'permanent'})).expiresAt,null)
 for(const customHours of [0,-1,'12',87601,null]) assert.equal((await request('/api/shares','POST',{bucket:'shared',key:'a',folder:false,duration:'custom',customHours})).status,400)
})
test('expired, revoked and guessed links are unavailable; only creator can revoke',async()=>{
 const s=await create()
 await request(`/api/shares/${s.id}`,'DELETE',undefined,'other')
 assert.equal((await request(s.path)).status,200)
 assert.deepEqual((await (await request('/api/shares?bucket=shared&key=photos%2Fa.jpg','GET',undefined,'other')).json()).shares,[])
 await request(`/api/shares/${s.id}`,'DELETE')
 assert.equal((await request(s.path)).status,404)
 const other=await create(); records.get(other.id)!.expiresAt=new Date(Date.now()-1)
 assert.equal((await request(other.path)).status,404)
 assert.equal((await request('/api/public/'+ 'x'.repeat(43))).status,404)
})
test('file shares cannot access siblings; downloads force attachment and expire within 60 seconds',async()=>{
 const s=await create()
 assert.equal((await request(s.path+'?key=photos/secret.jpg&download=1')).status,404)
 const res=await request(s.path+'?download=1');assert.equal(res.status,303)
 const url=new URL(res.headers.get('location')!);assert.ok(Number(url.searchParams.get('X-Amz-Expires'))<=60)
 assert.match(url.searchParams.get('response-content-disposition')!,/^attachment/)
 assert.equal(url.searchParams.get('response-content-type'),'application/octet-stream')
})
test('folder boundaries reject traversal and adjacent prefixes; browsing is paginated',async()=>{
 const s=await create({key:'photos/',folder:true})
 for(const key of ['photos-other/a','private/a','photos/../secret','photos/./a','photos/\\secret']) assert.equal((await request(s.path+'?key='+encodeURIComponent(key)+'&download=1')).status,404)
 const res=await request(s.path);assert.match(await res.text(),/Next page/)
 assert.equal((await request(s.path+'?key=photos/nested/')).status,200)
 assert.equal((await request(s.path+'?key=photos/a.jpg&download=1')).status,303)
 await request(s.path+'?cursor=next-page')
 assert.equal(calls.at(-1)!.input.ContinuationToken,'next-page')
})
test('private shares require owner unlock; deleted private buckets invalidate links',async()=>{
 buckets.buckets.set('vault-private-a',{_id:'vault-private-a',ownerId:'owner',label:'private',version:1,passwordHash:'unused',state:'active'})
 for(const user of ['owner','other','admin']) assert.equal((await request('/api/shares','POST',{bucket:'vault-private-a',key:'a',folder:false,duration:'1h'},user)).status,user==='owner'?423:404)
 // Seed a previously authorized public grant to exercise the public lifetime.
 const s=await create();const record=records.get(s.id)!;record.bucket='vault-private-a';record.privateOwner='owner'
 assert.equal((await request(s.path)).status,200)
 await buckets.revoke('vault-private-a');assert.equal((await request(s.path)).status,200)
 await buckets.markDeleted('vault-private-a');assert.equal((await request(s.path)).status,404)
})

test('public page uses Vault file rows, sharer identity, readable expiry and escaped filenames',async()=>{
 const s=await create({key:'<script>alert(1).txt'})
 const html=await (await request(s.path)).text()
 assert.match(html,/class="brand"/)
 assert.match(html,/Shared by/)
 assert.match(html,/>owner</)
 assert.match(html,/Sharing duration/)
 assert.match(html,/1 hour/)
 assert.match(html,/Available until/)
 assert.match(html,/UTC/)
 assert.match(html,/&lt;script&gt;/)
 assert.ok(!html.includes('<script>'))
 assert.ok(!html.includes('owner@example.com'))
 assert.match(html,/class="row"/)
 const permanent=await create({duration:'permanent'})
 assert.match(await (await request(permanent.path)).text(),/Until the owner revokes it/)
})
