import { mkdir, writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import type { OpenAPI3 } from 'openapi-typescript'

export async function createDirectory(path: string) {
  const pathSegments = path.split('/')
  if (pathSegments.at(-1)?.match(/\.\w+$/m)) pathSegments.pop()

  try {
    await mkdir(join(...pathSegments), { recursive: true })
  } catch (e) {
    console.log(e)
  }
}

export async function saveFile(
  path: string,
  contents:
    | string
    | NodeJS.ArrayBufferView
    | Iterable<string | NodeJS.ArrayBufferView>
    | AsyncIterable<string | NodeJS.ArrayBufferView>,
) {
  await createDirectory(path)
  const fileName = path.split('/').at(-1)
  if (!fileName) throw Error(`Could not parse the filename for "${path}"`)
  await writeFile(path, contents)
}

export async function readSchemaFromDisk(
  path: string,
): Promise<Required<Pick<OpenAPI3, 'servers' | 'components' | 'paths'>> & OpenAPI3> {
  const schema = JSON.parse((await readFile(path)).toString())
  validateOpenAPI3Schema(schema)
  return schema
}

export function validateOpenAPI3Schema(schema: OpenAPI3): void {
  if (!schema.servers?.at(0)?.url)
    throw Error('Parsed API docs do not have a valid server declaration')
  if (!schema.components?.schemas)
    throw Error('Parsed API docs do not have a valid schemas declaration')
  if (!schema.paths) throw Error('Parsed API docs do not have a valid paths declaration')
}
