import assert from 'node:assert/strict'
import { test, mock } from 'node:test'
import { S3Client } from '@aws-sdk/client-s3'
import { getObjectMetadata } from '../server/object-metadata.ts'
import { encryptShareToken, recoverShareToken } from '../server/share-token.ts'

test('share tokens are recoverable, encrypted with random IVs, and tamper resistant', () => {
 const token='a'.repeat(43), encrypted=encryptShareToken(token)
 assert.equal(recoverShareToken(encrypted),token)
 assert.notEqual(encryptShareToken(token),encrypted)
 assert.ok(!encrypted.includes(token))
 const bytes=Buffer.from(encrypted,'base64url');bytes[20]^=1
 assert.equal(recoverShareToken(bytes.toString('base64url')),undefined)
 assert.equal(recoverShareToken(undefined),undefined)
})
test('folder metadata includes every page and excludes folder markers from file counts',async()=>{
 const client=new S3Client({region:'us-east-1'});let calls=0
 const stub=mock.method(client,'send',async(command)=>{
  calls++
  assert.equal(command.input.Prefix,'root/')
  if(calls===1)return {Contents:[{Key:'root/',Size:0},{Key:'root/a.txt',Size:4},{Key:'root/nested/',Size:0}],IsTruncated:true,NextContinuationToken:'page2'}
  assert.equal(command.input.ContinuationToken,'page2')
  return {Contents:[{Key:'root/nested/deeper/b.txt',Size:8,LastModified:new Date('2026-01-01')}]}
 })
 try {const result=await getObjectMetadata(client,'bucket','root/');assert.equal(result.size,12);assert.equal(result.fileCount,2);assert.equal(result.folderCount,2);assert.equal(result.partial,false);assert.equal(result.lastModified,'2026-01-01T00:00:00.000Z')}finally{stub.mock.restore()}
})
test('file metadata uses HEAD and returns exact size, MIME type and storage identifiers',async()=>{
 const client=new S3Client({region:'us-east-1'})
 const stub=mock.method(client,'send',async command=>{assert.equal(command.constructor.name,'HeadObjectCommand');return {ContentLength:42,ContentType:'text/plain',ETag:'"etag"',Metadata:{author:'Owner'}}})
 try{const data=await getObjectMetadata(client,'bucket','a.txt');assert.equal(data.size,42);assert.equal(data.contentType,'text/plain');assert.equal(data.etag,'etag');assert.deepEqual(data.metadata,{author:'Owner'})}finally{stub.mock.restore()}
})
test('folder metadata marks capped scans as partial',async()=>{
 const client=new S3Client({region:'us-east-1'});let calls=0
 const stub=mock.method(client,'send',async()=>{calls++;return {Contents:[],IsTruncated:true,NextContinuationToken:String(calls)}})
 try{assert.equal((await getObjectMetadata(client,'bucket','root/')).partial,true);assert.equal(calls,10)}finally{stub.mock.restore()}
})
