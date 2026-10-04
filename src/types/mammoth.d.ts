declare module 'mammoth' {
  export interface MammothMessage {
    type: string
    message: string
  }

  export interface ConvertResult {
    value: string
    messages: MammothMessage[]
  }

  export interface ConvertInput {
    arrayBuffer?: ArrayBuffer
    buffer?: unknown
    path?: string
  }

  export function convertToHtml(input: ConvertInput): Promise<ConvertResult>
  export function extractRawText(input: ConvertInput): Promise<ConvertResult>

  const mammoth: {
    convertToHtml: typeof convertToHtml
    extractRawText: typeof extractRawText
  }

  export default mammoth
}
