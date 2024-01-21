import fetch from 'node-fetch'
import type { OpenAPI3 } from 'openapi-typescript'

import { saveFile, validateOpenAPI3Schema } from './util'

export type DownloadOptions = Partial<{
  local: boolean
  remote: boolean
  url: string
  output: string
  dryrun: boolean
}>

function normalizeDownloadOptions(options: DownloadOptions): Required<DownloadOptions> {
  const dryrun = options.dryrun ?? false
  const local =
    (options.url ? false : undefined) ??
    (options.remote ? false : undefined) ??
    options.local ??
    true
  const remote =
    (options.url ? false : undefined) ?? (local ? false : undefined) ?? options.remote ?? false
  const output = options.output ?? 'src/openapi/openapi.json'
  const url =
    options.url ??
    (local ? 'http://localhost:8080/api/docs' : undefined) ??
    (remote ? 'https://bellbooks-backend.ue.r.appspot.com/api/docs' : undefined) ??
    'http://localhost:8080/api/docs'

  return { local, remote, output, url, dryrun } satisfies DownloadOptions
}

export async function download(options: DownloadOptions): Promise<OpenAPI3 | undefined> {
  const { url } = normalizeDownloadOptions(options)

  let jsonContent: unknown
  try {
    const response = await fetch(url)
    jsonContent = await response.json()
  } catch (error) {
    console.error(`❌ Failed to download openapi spec from "${url}"`, error)
    return undefined
  }

  try {
    validateOpenAPI3Schema(jsonContent as unknown as OpenAPI3)
  } catch (error) {
    console.error(`❌ Response is not a valid OpenAPI3 schema`, error)
    console.error(`Response from ${url}: `, JSON.stringify(jsonContent, null, 2))
    return undefined
  }

  return jsonContent as unknown as OpenAPI3
}

export async function downloadAndSave(options: DownloadOptions) {
  const { url, output, dryrun } = normalizeDownloadOptions(options)

  let schema: OpenAPI3 | undefined
  try {
    schema = await download(options)
    if (!schema) throw Error(`Response is not a valid OpenAPI3 schema`)
  } catch (error) {
    console.error(`❌ Failed to download OpenAPI schema from ${url}`, error)
    return
  }

  if (dryrun) {
    console.log(`Received openapi spec:`, schema)
    console.log(`✅ Dry run successful`)
    return
  }

  try {
    await saveFile(output, JSON.stringify(schema, null, 2))
  } catch (error) {
    console.log(`Received openapi spec:`, schema)
    console.error(`❌ Failed to save openapi spec to disk at ${output}`, error)
    return
  }

  console.log(`✅ Successfully saved openAPI schema from "${url}" to "${output}"`)
}
