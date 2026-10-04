/** Shared by the form and API so invalid names never reach storage. */
export function validateBucketName(name: unknown): string | null {
  if (typeof name !== 'string' || !name) return 'Enter a bucket name'
  if (name.length < 3 || name.length > 63) return 'Use between 3 and 63 characters'
  if (!/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(name)) {
    return 'Use lowercase letters, numbers, dots or hyphens; start and end with a letter or number'
  }
  if (name.includes('..') || name.includes('.-') || name.includes('-.')) {
    return 'Dots must separate letters or numbers'
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(name)) return 'Bucket names cannot be IP addresses'
  if (/^(xn--|sthree-|amzn-s3-demo-)/.test(name) || /(-s3alias|--ol-s3|\.mrap|--x-s3|--table-s3)$/.test(name)) {
    return 'This bucket name uses a reserved prefix or suffix'
  }
  return null
}

export function chooseBucket(buckets: string[], preferred: string, privateBucket: string, defaultBucket: string): string {
  return [preferred, privateBucket, defaultBucket].find((name) => buckets.includes(name)) || buckets[0] || ''
}
