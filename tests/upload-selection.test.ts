import assert from 'node:assert/strict'
import { test } from 'node:test'
import { selectDroppedFiles, selectUploadFiles } from '../src/lib/uploadSelection.ts'

function fileEntry(name: string): FileSystemEntry {
  return { name, isFile: true, isDirectory: false,
    file: (resolve: (file: File) => void) => resolve(new File(['contents'], name)),
  } as unknown as FileSystemEntry
}
function directory(name: string, children: FileSystemEntry[], batchSize = 100): FileSystemEntry {
  return { name, isFile: false, isDirectory: true, createReader() {
    let index = 0
    return { readEntries(resolve: (entries: FileSystemEntry[]) => void) {
      const batch = children.slice(index, index + batchSize)
      index += batchSize
      resolve(batch)
    } }
  } } as unknown as FileSystemEntry
}
function drop(entries: FileSystemEntry[]) {
  return { items: entries.map(entry => ({ kind: 'file', webkitGetAsEntry: () => entry })), files: [] } as unknown as DataTransfer
}
const signal = () => new AbortController().signal

test('mixed drops preserve root folders, nested paths, same-name files and empty folders', async () => {
  const selection = selectDroppedFiles(drop([
    fileEntry('loose.txt'),
    directory('Photos', [fileEntry('same.jpg'), directory('Summer', [fileEntry('same.jpg')]), directory('Empty', [])]),
    directory('Empty root', []),
  ]))
  const items = await selection(signal())
  assert.deepEqual(items.map(item => item.path), ['loose.txt', 'Photos/same.jpg', 'Photos/Summer/same.jpg', 'Photos/Empty', 'Empty root'])
  assert.deepEqual(items.map(item => item.file === null), [false, false, false, true, true])
  assert.equal(await items[2].file!.text(), 'contents')
})

test('directory readers are drained past the first 100 entries', async () => {
  const items = await selectDroppedFiles(drop([directory('Many', Array.from({ length: 251 }, (_, i) => fileEntry(`${i}.txt`)))]))(signal())
  assert.equal(items.length, 251)
  assert.equal(items.at(-1)?.path, 'Many/250.txt')
})

test('all roots are captured before the drop event data becomes unavailable', async () => {
  const data = drop([fileEntry('one'), directory('two', [fileEntry('three')])])
  const selection = selectDroppedFiles(data)
  for (const item of Array.from(data.items)) item.webkitGetAsEntry = () => { throw Error('Drop event ended') }
  assert.deepEqual((await selection(signal())).map(item => item.path), ['one', 'two/three'])
})

test('regular file selections and browsers without entry APIs still work', async () => {
  const file = new File([], 'zero.txt')
  const files = [file]
  const selection = selectUploadFiles(files)
  files.length = 0
  assert.deepEqual(await selection(signal()), [{ file, path: 'zero.txt' }])
  const data = { items: [{ kind: 'string' }, { kind: 'file', getAsFile: () => file }], files: [file] } as unknown as DataTransfer
  assert.deepEqual(await selectDroppedFiles(data)(signal()), [{ file, path: 'zero.txt' }])
})

test('unreadable entries fail instead of silently skipping part of a folder', async () => {
  const broken = { name: 'blocked', isFile: true, file: (_resolve: unknown, reject: (e: DOMException) => void) => reject(new DOMException('Permission denied')) } as unknown as FileSystemEntry
  await assert.rejects(selectDroppedFiles(drop([directory('Root', [fileEntry('ok'), broken])]))(signal()), /Cannot read Root\/blocked/)
})

test('cancelling during folder enumeration rejects promptly', async () => {
  const controller = new AbortController()
  const stalled = { name: 'Slow', isDirectory: true, createReader: () => ({ readEntries: () => {} }) } as unknown as FileSystemEntry
  const reading = selectDroppedFiles(drop([stalled]))(controller.signal)
  controller.abort()
  await assert.rejects(reading, { name: 'AbortError' })
})

test('invalid paths cannot escape the chosen destination', async () => {
  await assert.rejects(selectDroppedFiles(drop([directory('Root', [fileEntry('..')])]))(signal()), /invalid file path/)
  await assert.rejects(selectUploadFiles([new File([], '../escape')])(signal()), /invalid file path/)
})
