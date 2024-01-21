import openapiTS, { type OpenAPI3 } from 'openapi-typescript'
import { readSchemaFromDisk, saveFile } from './util'

export type ConvertOptions = Partial<{
  input: string
  output: string
  dryrun: boolean
}>

function normalizeConvertOptions(options: ConvertOptions): Required<ConvertOptions> {
  const dryrun = options.dryrun ?? false
  const input = options.input ?? 'src/openapi/openapi.json'
  const output = options.output ?? 'src/openapi/openapi.ts'

  return { input, output, dryrun } satisfies ConvertOptions
}

export async function convertAndSave(options: ConvertOptions) {
  const { input, output, dryrun } = normalizeConvertOptions(options)

  let openAPISchema: OpenAPI3
  try {
    openAPISchema = await readSchemaFromDisk(input)
  } catch (error) {
    console.error(`❌ Failed to import openAPI schema json from "${input}"`, error)
    return
  }

  let openAPITypescript: string
  try {
    openAPITypescript = await openapiTS(openAPISchema)
  } catch (error) {
    console.error(`❌ Failed to convert openAPI schema json from "${input}"`, error)
    return
  }

  if (dryrun) {
    console.log(openAPITypescript)
    console.log(`✅ Dry run successful`)
    return
  }

  try {
    await saveFile(output, openAPITypescript)
  } catch (error) {
    console.error(`❌ Failed to save openAPI types to disk at "${output}"`, error)
  }

  console.log(`✅ Successfully saved openAPI types to "${output}`)
}
