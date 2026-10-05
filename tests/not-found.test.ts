import assert from 'node:assert/strict'
import { test, after } from 'node:test'
import { once } from 'node:events'
import express from 'express'
import { notFound } from '../server/not-found.ts'
import { createS3Router } from '../server/s3.ts'
import { BucketProtection } from '../server/bucket-protection.ts'
import { MemoryBucketStore } from './helpers/bucket-store.ts'
const app=express()
app.use('/api',createS3Router(new BucketProtection(new MemoryBucketStore()),(_req,res)=>{res.status(401).json({error:'Unauthorized'})}))
app.use('/api',notFound)
const server=app.listen(0,'127.0.0.1');await once(server,'listening')
const address=server.address();if(!address || typeof address==='string')throw Error('No address')
const base=`http://127.0.0.1:${address.port}`
after(()=>server.close())
test('browser navigation to /api/pu shows branded 404 even without login',async()=>{
 const res=await fetch(base+'/api/pu',{headers:{Accept:'text/html,application/xhtml+xml'}})
 assert.equal(res.status,404);assert.match(res.headers.get('content-type')!,/text\/html/);assert.match(await res.text(),/Page not found/)
})
test('unknown API requests keep JSON errors',async()=>{
 for(const accept of ['application/json','*/*']){const res=await fetch(base+'/api/pu',{headers:{Accept:accept}});assert.equal(res.status,404);assert.deepEqual(await res.json(),{error:'Not found'})}
})
test('known file and bucket routes still require authentication',async()=>{
 for(const path of ['/files','/metadata?key=a','/buckets','/download?key=a','/upload-url?key=a','/raw?key=a']){
  const res=await fetch(base+'/api'+path);assert.equal(res.status,401,path)
 }
})
