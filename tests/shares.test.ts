import { Readable } from 'node:stream'
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
let contentType = 'image/jpeg'
let storageFailure: Error | undefined
const stub = mock.method(S3Client.prototype, 'send', async command => {
  calls.push({name:command.constructor.name,input:command.input})
  if(storageFailure) throw storageFailure
  if(command.constructor.name === 'HeadObjectCommand') return {ContentType:contentType,ContentLength:100}
  if(command.constructor.name === 'GetObjectCommand') return {Body:Readable.from(['<script>alert(1)</script>'])}
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
beforeEach(()=>{records.clear();buckets.buckets.clear();calls.length=0;contentType='image/jpeg';storageFailure=undefined})
after(async()=>{stub.mock.restore();await new Promise<void>(resolve=>server.close(()=>resolve()))})

test('creates opaque random links, stores no plaintext tokens, and opens without login',async()=>{
 const a=await create(),b=await create()
 assert.match(a.path,/^\/api\/public\/[A-Za-z0-9_-]{43}$/);assert.notEqual(a.path,b.path)
 assert.ok(!JSON.stringify([...records.values()]).includes(a.path.split('/').pop()))
 const entry=await request(a.path,'GET',undefined,'');assert.equal(entry.status,303)
 assert.match(entry.headers.get('location')!,/^\/share#token=/)
 const res=await request(a.path+'?view=1','GET',undefined,'');assert.equal(res.status,200)
 assert.equal(res.headers.get('Referrer-Policy'),'no-referrer');assert.equal((await res.json()).entries[0].name,'a.jpg')
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
 assert.equal((await request(s.path+'?view=1')).status,200)
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
 const res=await request(s.path+'?view=1');assert.equal((await res.json()).nextCursor,'next-page')
 assert.equal((await request(s.path+'?view=1&key=photos/nested/')).status,200)
 assert.equal((await request(s.path+'?key=photos/a.jpg&download=1')).status,303)
 await request(s.path+'?view=1&cursor=next-page')
 assert.equal(calls.at(-1)!.input.ContinuationToken,'next-page')
})
test('private shares require owner unlock; deleted private buckets invalidate links',async()=>{
 buckets.buckets.set('vault-private-a',{_id:'vault-private-a',ownerId:'owner',label:'private',version:1,passwordHash:'unused',state:'active'})
 for(const user of ['owner','other','admin']) assert.equal((await request('/api/shares','POST',{bucket:'vault-private-a',key:'a',folder:false,duration:'1h'},user)).status,user==='owner'?423:404)
 // Seed a previously authorized public grant to exercise the public lifetime.
 const s=await create();const record=records.get(s.id)!;record.bucket='vault-private-a';record.privateOwner='owner'
 assert.equal((await request(s.path+'?view=1')).status,200)
 await buckets.revoke('vault-private-a');assert.equal((await request(s.path+'?view=1')).status,200)
 await buckets.markDeleted('vault-private-a');assert.equal((await request(s.path)).status,404)
})

test('public browser data includes sharer, expiry and file metadata without private account details',async()=>{
 const s=await create({key:'<script>alert(1).txt'})
 const data=await (await request(s.path+'?view=1','GET',undefined,'')).json()
 assert.equal(data.sharer,'owner')
 assert.equal(data.entries[0].name,'<script>alert(1).txt')
 assert.equal(data.entries[0].size,100)
 assert.equal(data.entries[0].isFolder,false)
 assert.equal(data.expiresAt,s.expiresAt)
 assert.ok(!JSON.stringify(data).includes('owner@example.com'))
 assert.equal(data.bucket,undefined);assert.equal(data.ownerId,undefined)
 const permanent=await create({duration:'permanent'})
 assert.equal((await (await request(permanent.path+'?view=1')).json()).expiresAt,null)
})

test('owners can retrieve exactly the same public URL; legacy hashes remain nonrecoverable',async()=>{
 const share=await create()
 let data=await (await request('/api/shares?bucket=shared&key=photos%2Fa.jpg')).json()
 assert.equal(data.shares[0].path,share.path)
 assert.ok(records.get(share.id)!.encryptedToken)
 delete records.get(share.id)!.encryptedToken
 data=await (await request('/api/shares?bucket=shared&key=photos%2Fa.jpg')).json()
 assert.equal(data.shares[0].path,undefined)
 assert.equal((await request(share.path+'?view=1')).status,200)
})

test('revoked, expired and malformed links render unavailable pages without file information',async()=>{
 const share=await create(); await request(`/api/shares/${share.id}`,'DELETE')
 for(const path of [share.path,share.path+'?preview=1','/api/public/invalid']) {
  const response=await request(path);assert.equal(response.status,404);assert.match(response.headers.get('content-type')!,/text\/html/)
  const html=await response.text();assert.match(html,/Files unavailable/);assert.ok(!html.includes('photos/a.jpg'))
 }
 const missing=await request('/api/public/unknown/route');assert.equal(missing.status,404);assert.match(await missing.text(),/Page not found/)
})
test('preview links redirect to the shared React modal and metadata stays token-scoped',async()=>{
 const share=await create()
 const response=await request(share.path+'?preview=1');assert.equal(response.status,303)
 assert.match(response.headers.get('location')!,/^\/share#token=/)
 const metadata=await request(share.path+'?metadata=1');assert.equal(metadata.status,200);assert.equal((await metadata.json()).file.name,'a.jpg')
 const media=await request(share.path+'?raw=1');assert.equal(media.status,303);assert.match(media.headers.get('location')!,/X-Amz-Expires=60/)
 for(const mode of ['metadata','raw','view']) assert.equal((await request(share.path+`?${mode}=1&key=secret`)).status,404)
 await request(`/api/shares/${share.id}`,'DELETE')
 for(const mode of ['metadata','raw','view']) assert.equal((await request(share.path+`?${mode}=1`)).status,404)
})
test('text and office bytes use bounded same-origin loading with inert response headers',async()=>{
 for(const key of ['.env','example.docx','book.xlsx','text.html']) {
  const share=await create({key});const res=await request(share.path+'?raw=1')
  assert.equal(res.status,200);assert.equal(res.headers.get('content-disposition'),'attachment');assert.match(res.headers.get('content-security-policy')!,/sandbox/)
  assert.equal(await res.text(),'<script>alert(1)</script>')
 }
})
test('missing objects and storage failures use safe branded error pages',async()=>{
 const share=await create();storageFailure=Object.assign(Error('private storage details'),{name:'NoSuchKey'})
 assert.match(await (await request(share.path+'?metadata=1')).text(),/Files unavailable/)
 storageFailure=Error('private storage details');const res=await request(share.path+'?view=1');assert.equal(res.status,500)
 const html=await res.text();assert.match(html,/Something went wrong/);assert.ok(!html.includes('private storage details'))
})

test('generic-MIME images use the same filename classification as Vault',async()=>{
 contentType='application/octet-stream';const share=await create({key:'photo.png'})
 const res=await request(share.path+'?raw=1')
 assert.equal(res.status,303);assert.match(res.headers.get('location')!,/response-content-type=image%2Fpng/)
})

test('deep folder preview loads its parent listing and view requests enforce share boundaries',async()=>{
 const share=await create({key:'photos/',folder:true})
 const data=await (await request(share.path+'?view=1&key=photos/nested/a.jpg')).json()
 assert.equal(data.requested,'photos/nested/')
 assert.equal(calls.at(-1)!.input.Prefix,'photos/nested/')
 for(const key of ['photos-other/a','private/a','photos/../secret','photos/./a','photos/\\secret']) {
  assert.equal((await request(share.path+'?view=1&key='+encodeURIComponent(key))).status,404)
 }
 records.get(share.id)!.expiresAt=new Date(Date.now()-1)
 assert.equal((await request(share.path+'?view=1')).status,404)
})
