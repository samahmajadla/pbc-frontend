import ts from 'typescript'
import { join } from 'path'
import type { OpenAPI3 } from 'openapi-typescript'

import { saveFile, readSchemaFromDisk } from './util'

export type CodegenOptions = Partial<{
  output: string
  schema: string
  types: string
  dryrun: boolean
}>

type EndpointData = {
  meta: {
    methodName: string
    controller: string
  }

  method: 'get' | 'post' | 'put' | 'delete'
  path: string

  query?: { [index: string | number | symbol]: string }
  pathVariables?: { [index: string | number | symbol]: string }
  body?: {
    required: boolean
    type: string
  }
  response?: string
}

function normalizeCodegenOptions(options: CodegenOptions): Required<CodegenOptions> {
  const dryrun = options.dryrun ?? false
  const output = options.output ?? 'dist/api'
  const schema = options.schema ?? 'src/openapi/openapi.json'
  const types = options.types ?? 'src/openapi/openapi.ts'

  return { output, schema, types, dryrun } satisfies CodegenOptions
}

export function codegen(
  schema: OpenAPI3,
  typescript: string,
): { models: string; endpoints: string; index: string } {
  const sourceFile = ts.createSourceFile('in-memory.ts', typescript, ts.ScriptTarget.ES2022)
  const interfaces = Object.keys(schema.components!.schemas!)

  const models = codegenModels({ sourceFile, interfaces })
  const endpoints = codegenEndpoints({ schema, interfaces, url: schema.servers!.at(0)!.url })
  const index =
    ['models', 'endpoints'].map((filename) => `export * from './${filename}'`).join('\n') + '\n'

  return { models, endpoints, index }
}

export async function codegenAndSave(options: CodegenOptions) {
  const { output, schema: schemaPath, types: typesPath, dryrun } = normalizeCodegenOptions(options)

  let schema: Awaited<ReturnType<typeof readSchemaFromDisk>>
  try {
    schema = await readSchemaFromDisk(schemaPath)
  } catch (error) {
    return console.error(`❌ Failed to load schema file from "${schemaPath}"`, error)
  }

  const interfaceNames = Object.keys(schema.components.schemas!)

  const tsProgram = ts.createProgram([typesPath], {})
  const tsSource = tsProgram.getSourceFile(typesPath)

  if (!tsSource) {
    return console.error(`❌ Failed to load "${typesPath}" as a valid typescript target`)
  }

  console.log(`Generating HTTP client methods...`)

  try {
    await generateModels({
      sourceFile: tsSource,
      interfaces: interfaceNames,
      outputDirectory: output,
      outputFile: 'models.ts',
      dryrun,
    })
  } catch (error) {
    return console.error(`  ❌ Failed to generate models from "${typesPath}"`, error)
  }

  try {
    await generateEndpoints({
      schema,
      interfaces: interfaceNames,
      outputDirectory: output,
      outputFile: 'endpoints.ts',
      dryrun,
    })
  } catch (error) {
    return console.error(`  ❌ Failed to generate endpoint methods from "${schemaPath}"`, error)
  }

  try {
    await generateIndex({
      outputDirectory: output,
      outputFile: 'index.ts',
      includeFiles: ['./models', './endpoints'],
      dryrun,
    })
  } catch (error) {
    return console.error(
      `  ❌ Failed to generate project index file at "${join(output, 'index.ts')}"`,
      error,
    )
  }

  console.log(`✅ Completed all code generation and saved to "${output}"`)
}

export async function generateModels({
  sourceFile,
  interfaces,
  outputDirectory,
  outputFile,
  dryrun,
}: {
  sourceFile: ts.SourceFile
  interfaces: string[]
  outputDirectory: string
  outputFile: string
  dryrun: boolean
}) {
  const buffer = codegenModels({ sourceFile, interfaces })
  const outputPath = join(outputDirectory, outputFile)

  if (dryrun) {
    console.log(buffer)
    console.log(`  ✅ Successfully generated models (dryrun for "${outputPath}")`)
    return
  }

  await saveFile(outputPath, buffer)
  console.log(`  ✅ Successfully generated models and saved to ${outputPath}`)
}

export async function generateEndpoints({
  schema,
  interfaces,
  outputDirectory,
  outputFile,
  dryrun,
}: {
  schema: Required<Pick<OpenAPI3, 'servers' | 'components' | 'paths'>> & OpenAPI3
  interfaces: string[]
  outputDirectory: string
  outputFile: string
  dryrun: boolean
}) {
  const buffer = codegenEndpoints({ schema, interfaces, url: schema.servers.at(0)!.url })
  const outputPath = join(outputDirectory, outputFile)

  if (dryrun) {
    console.log(buffer)
    console.log(`  ✅ Successfully generated endpoints (dryrun for "${outputPath}")`)
    return
  }

  await saveFile(outputPath, buffer)
  console.log(`  ✅ Successfully generated endpoints and saved to ${outputPath}`)
}

export async function generateIndex({
  outputDirectory,
  outputFile,
  includeFiles,
  dryrun,
}: {
  outputDirectory: string
  outputFile: string
  includeFiles: string[]
  dryrun: boolean
}) {
  const buffer = includeFiles.map((filename) => `export * from '${filename}'`).join('\n') + '\n'
  const outputPath = join(outputDirectory, outputFile)

  if (dryrun) {
    console.log(buffer)
    console.log(`  ✅ Successfully generated index (dryrun for "${outputPath}")`)
    return
  }

  await saveFile(outputPath, buffer)
  console.log(`  ✅ Successfully generated index and saved to ${outputPath}`)
}

function codegenModels({
  interfaces,
  sourceFile,
}: {
  interfaces: string[]
  sourceFile: ts.SourceFile
}): string {
  let buffer = 'export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }\n'
  buffer += `export type ForeignKey<Entity extends ${interfaces.join(
    ' | ',
  )}> = Required<Pick<Entity, 'id'>> & Partial<Entity>\n`

  const componentsInterface = sourceFile.statements.find(
    (statement) =>
      ts.isInterfaceDeclaration(statement) &&
      statement.name &&
      statement.name.text === 'components',
  ) as ts.InterfaceDeclaration | undefined
  if (componentsInterface) {
    const schemasProperty = componentsInterface.members.find(
      (statement) =>
        ts.isPropertySignature(statement) && statement.name?.getText(sourceFile) === 'schemas',
    ) as ts.PropertySignature | undefined
    if (schemasProperty) {
      schemasProperty.forEachChild((node) => {
        if (ts.isTypeLiteralNode(node)) {
          node.forEachChild((node) => {
            const components = node.getText(sourceFile).split(':')
            const name = components.shift()
            let declaration = components
              .join(':')
              .trim()
              .replace(/components\["schemas"\]\["(\w+)"\]/gi, '$1')
              .replaceAll(/ {2,}/g, '  ')
              .replaceAll(/^  \}/gm, '}')
            declaration = declaration.replaceAll(
              new RegExp(`([^<"])(${interfaces.join('|')})`, 'g'),
              '$1ForeignKey<$2>',
            )
            const type = `export type ${name} = ${declaration}`.replaceAll(';', '')
            buffer += `\n${type}\n`
          })
        }
      })
    }
  }

  return buffer
}

function codegenEndpoints({
  schema,
  interfaces,
  url,
}: {
  schema: OpenAPI3
  interfaces: string[]
  url: string
}) {
  let buffer = `import type {\n`
  interfaces.forEach((name) => (buffer += `  ${name},\n`))
  buffer += `} from './models'\n\n`

  buffer += `type Fetch = (input: URL | RequestInfo, init?: RequestInit) => Promise<Response>\n\n`

  buffer += `export const BASE_URL = '${url}'\n\n`

  buffer += `function resolveURL(url: URL, { query, path }: { query?: {[index: string]: any}, path?: {[index: string]: any}}): string {\n`
  buffer += `  let resolvedURL = url.toString()\n`
  buffer += `  \n`
  buffer += `  if (path) {\n`
  buffer += `    for (const [key, value] of Object.entries(path)) {\n`
  buffer += `      const variablePattern = new RegExp(\`{\s*\${key}\s*}\`, 'g')\n`
  buffer += `      resolvedURL = resolvedURL.replace(variablePattern, value)\n`
  buffer += `    }\n`
  buffer += `  }\n`
  buffer += `\n`
  buffer += `  if (query) {\n`
  buffer += `    const searchParams = new URLSearchParams(query)\n`
  buffer += `    const queryString = searchParams.toString()\n`
  buffer += `\n`
  buffer += `    if (queryString) {\n`
  buffer += `      resolvedURL += resolvedURL.includes('?') ? \`&\${queryString}\` : \`?\${queryString}\`\n`
  buffer += `    }\n`
  buffer += `  }\n`
  buffer += `\n`
  buffer += `  return resolvedURL\n`
  buffer += `}\n\n`

  const endpoints = parseEndpoints(schema)
  const endpointMethods = endpoints.map(codegenEndpointMethod)
  endpointMethods.forEach(
    (method, index) => (buffer += method + (index === endpointMethods.length - 1 ? '\n' : '\n\n')),
  )

  return buffer
}

function codegenEndpointMethodSignature(endpoint: EndpointData): string[] {
  const hasQuery = 'query' in endpoint
  const hasVariables = 'pathVariables' in endpoint
  const hasBody = 'body' in endpoint

  const sum: number = [hasQuery, hasVariables, hasBody]
    .map((truthy) => (truthy ? 1 : 0) as number)
    .reduce((acc: number, next) => acc + next)

  let fnArguments: string[] = []

  if (sum === 1) {
    if (hasQuery)
      fnArguments.push(
        '  query: ' + tsStringify(endpoint.query!, Object.keys(endpoint.query!).length > 2, 4),
      )
    if (hasVariables)
      fnArguments.push(
        '  path: ' +
          tsStringify(endpoint.pathVariables!, Object.keys(endpoint.pathVariables!).length > 2, 4),
      )
    if (hasBody)
      fnArguments.push(`  body${endpoint.body!.required ? '' : '?'}: ` + endpoint.body!.type)
  } else if (sum > 1) {
    fnArguments.push(
      '  { ' +
        [hasQuery ? 'query' : null, hasVariables ? 'path' : null, hasBody ? 'body' : null]
          .filter((x) => !!x)
          .join(', ') +
        ' }: {',
    )

    if (hasQuery) {
      const typedef =
        Object.keys(endpoint.query!).length > 1
          ? tsStringify(endpoint.query!, true, 6).split('\n')
          : [tsStringify(endpoint.query!)]
      fnArguments.push('    query: ' + typedef.shift() + (typedef.length > 0 ? '' : ', '))
      if (typedef.length > 0)
        typedef.forEach((line, index) =>
          fnArguments.push(line + (index === typedef.length - 1 ? ', ' : '')),
        )
    }

    if (hasVariables) {
      const typedef =
        Object.keys(endpoint.pathVariables!).length > 1
          ? tsStringify(endpoint.pathVariables!, true, 6).split('\n')
          : [tsStringify(endpoint.pathVariables!)]
      fnArguments.push(
        '    path: ' + typedef.shift() + (typedef.length === 0 && hasBody ? ', ' : ''),
      )
      if (typedef.length > 0)
        typedef.forEach((line, index) =>
          fnArguments.push(line + (index === typedef.length - 1 && hasBody ? ', ' : '')),
        )
    }

    if (hasBody) {
      fnArguments.push(`    body${endpoint.body!.required ? '' : '?'}: ` + endpoint.body!.type)
    }

    fnArguments.push('  }')
  }

  return [
    `export async function ${endpoint.meta.methodName}(`,
    '  fetch: Fetch,',
    ...fnArguments,
    `): Promise<${endpoint?.response ? endpoint.response + ' | undefined' : 'void'}> {`,
  ]
}

function codegenEndpointMethod(endpoint: EndpointData) {
  const hasQuery = 'query' in endpoint
  const hasVariables = 'pathVariables' in endpoint
  const hasBody = 'body' in endpoint

  const functionSignature = codegenEndpointMethodSignature(endpoint)
  const pathOptions =
    hasQuery && hasVariables
      ? `{ query, path }`
      : hasQuery
        ? `{ query }`
        : hasVariables
          ? `{ path }`
          : null

  const declareURL = !!pathOptions
    ? [
        `const url = resolveURL(`,
        `  new URL('${endpoint.path}', BASE_URL),`,
        `  ${pathOptions},`,
        `)`,
      ]
    : [`const url = new URL('${endpoint.path}', BASE_URL).toString()`]

  return [
    ...functionSignature,
    ...declareURL.map((text) => `  ${text}`),
    `  const options: RequestInit = {`,
    `    method: '${endpoint.method}',`,
    `    headers: { 'Content-Type': 'application/json' },`,
    endpoint.body && endpoint.body.required ? `    body: JSON.stringify(body),` : null,
    `  }`,
    ...(endpoint.body && !endpoint.body.required
      ? ['', `  if(body) options.body = JSON.stringify(body)`]
      : [null]),
    '',
    `  try {`,
    `    const response = await fetch(url, options)`,
    `    if (!response.ok)`,
    `      throw new Error(\`Request failed with status: \${ response.status }\`)`,
    endpoint.response ? `    return await response.json() as ${endpoint.response}` : `    return`,
    `  } catch(error) {`,
    ...(hasBody && endpoint.body!.required
      ? [
          `    console.error(\`received error while fetching url("\${ url }") with data(\${ JSON.stringify(body) })\`, error)`,
        ]
      : hasBody
        ? [
            `    if(body) console.error(\`received error while fetching url("\${ url }") with data(\${ JSON.stringify(body) })\`, error)`,
            `    else console.error(\`received error while fetching url: \${ url }\`, error)`,
          ]
        : [`    console.error(\`received error while fetching url: \${ url }\`, error)`]),
    `    return undefined`,
    `  }`,
    `}`,
  ]
    .filter((x) => x !== null)
    .join('\n')
}

function parseEndpoints({ paths }: OpenAPI3): EndpointData[] {
  const endpoints: EndpointData[] = []
  for (const path in paths) {
    const allOperations = paths[path]
    for (const httpMethod in allOperations) {
      const details = allOperations[httpMethod]
      const query = (details.parameters?.filter((parameter: any) => parameter.in === 'query') ??
        []) as any[]
      const pathVariables = (details.parameters?.filter(
        (parameter: any) => parameter.in === 'path',
      ) ?? []) as any[]
      const hasBody = !!details.requestBody

      const endpoint = {
        meta: {
          methodName: details.operationId,
          controller: details.tags[0],
        },
        method: httpMethod,
        path,
      } as any

      if (query.length > 0) {
        endpoint.query = {}
        query.forEach((parameter) => {
          endpoint.query[`${parameter.name}${parameter.required ? '' : '?'}`] = parseSchema(
            parameter.schema,
          )
        })
      }

      if (pathVariables.length > 0) {
        endpoint.pathVariables = {}
        pathVariables.forEach((parameter) => {
          endpoint.pathVariables[`${parameter.name}${parameter.required ? '' : '?'}`] = parseSchema(
            parameter.schema,
          )
        })
      }

      if (hasBody) {
        endpoint.body = {
          type: parseSchema(details.requestBody.content['application/json'].schema),
          required: details.requestBody.required,
        }
      }

      if (details.responses['200'].content) {
        endpoint.response = parseSchema(details.responses['200'].content['*/*'].schema)
      }

      endpoints.push(endpoint)
    }
  }
  return endpoints
}

function parseSchema(value: any): string {
  // { type: "type or array or undefined", $ref: "undefined or points to schema", items: "present when type=array, presumably has type or ref" }
  if (value.oneOf)
    return value.oneOf.map(({ $ref }: { $ref: string }) => parse$Ref($ref)).join(' | ')
  if (value.enum && value.type === 'string')
    return value.enum.map((value: string) => `'${value}'`).join(' | ')
  if (value.items && value.type !== 'array') return parseSchema(value.items)
  if (value.type === 'array') {
    if (value.items.type) return safeConvertSchemaValue(value.items.type) + '[]'
    return parseSchema(value.items).replaceAll(/(\w+)/g, '$1[]')
  }

  return safeConvertSchemaValue(value.type) ?? parse$Ref(value.$ref)
}

function parse$Ref(value: string): string {
  return value?.replace('#/components/schemas/', '')
}

function safeConvertSchemaValue(type: string): string {
  if (type === 'integer') return 'number'
  return type
}

const tsStringify = (
  obj: { [index: string | number | symbol]: any },
  addWhitespace = false,
  indentCount = 2,
): string => {
  const transform = JSON.stringify(
    obj,
    null,
    addWhitespace ? ''.padStart(indentCount, ' ') : undefined,
  )
    .replaceAll('"', '')
    .replaceAll(':', ': ')
    .replaceAll(',', ', ')
    .replace(/^}$/m, '}'.padStart(indentCount - 1, ' '))
  if (!addWhitespace) return transform.replace(/^{/m, '{ ').replace(/}$/m, ' }')
  return transform
}
