#! /usr/bin/env node

import { program, Option } from 'commander'
import openapiTS, { type OpenAPI3 } from 'openapi-typescript'
import { join } from 'path'

import { download } from './lib/download'
import { codegen } from './lib/codegen'
import { saveFile } from './lib/util'

type LogLevel = 'none' | 'error' | 'info' | 'verbose'
enum LogLevelValue {
  'none' = 0,
  'error' = 2,
  'info' = 5,
  'verbose' = 10,
}
type Options = Partial<{
  local: boolean
  remote: boolean
  url: string
  output: string

  logLevel: LogLevel
  dryRun: boolean
}>

function normalizeOptions(options: Options): Required<Options> {
  const dryRun = options.dryRun ?? false
  const logLevel = options.logLevel ?? 'info'
  const local =
    (options.url ? false : undefined) ??
    (options.remote ? false : undefined) ??
    options.local ??
    true
  const remote =
    (options.url ? false : undefined) ?? (local ? false : undefined) ?? options.remote ?? false
  const output = options.output ?? 'dist/api'
  const url =
    options.url ??
    (local ? 'http://localhost:8080/api/docs' : undefined) ??
    (remote ? 'https://bellbooks-backend.ue.r.appspot.com/api/docs' : undefined) ??
    'http://localhost:8080/api/docs'

  return { local, remote, output, url, dryRun, logLevel } satisfies Options
}

function Logger(allowedLevel: LogLevel) {
  const allowed = LogLevelValue[allowedLevel]
  return {
    verbose: (message: any, ...optionalParams: any[]) => {
      if (LogLevelValue['verbose'] <= allowed) console.log(message, ...optionalParams)
    },
    info: (message: any, ...optionalParams: any[]) => {
      if (LogLevelValue['info'] <= allowed) console.log(message, ...optionalParams)
    },
    error: (message: any, ...optionalParams: any[]) => {
      if (LogLevelValue['error'] <= allowed) console.error(message, ...optionalParams)
    },
  }
}

program
  .name('bellbooks-openapi-codegen')
  .description('CLI to generate client API methods to interface with BellBooks API')
  .version('0.0.1')
  .option('-l, --local', '(default) Set URL to the local instance of Bellbooks API docs endpoint')
  .option('-r, --remote', 'Set URL to the GCP-hosted instance of Bellbooks API docs endpoint')
  .option(
    '-u, --url <url>',
    'URL pointing to a live instance of the Bellbooks API documentation (default: "http://localhost:8080/api/docs")',
  )
  .option(
    '-o, --output <path>',
    'Designate the output directory for the generated code',
    'dist/api',
  )
  .addOption(
    new Option('-ll, --log-level <level>', 'Set logging level')
      .default('info')
      .choices(['none', 'error', 'info', 'verbose']),
  )
  .addOption(
    new Option('-v, --verbose', 'Set logging level to verbose').implies({ logLevel: 'verbose' }),
  )
  .option('-d, --dry-run', '[Test] Log to standard output without saving to disk', false)
  .action(async (options: Options) => {
    const { url, output, dryRun, logLevel } = normalizeOptions(options)
    const log = Logger(logLevel)

    log.info(`Generating client API methods for OpenAPI specification at "${url}"...`)

    let schema: OpenAPI3 | undefined
    try {
      schema = await download({ url })
      if (!schema) throw Error()
      log.info(`  ✅ Successfully downloaded OpenAPI Schema from "${url}"`)
      log.verbose({ schema })
    } catch (_) {
      // error is logged in download function
      return
    }

    let openAPITypescript: string
    try {
      openAPITypescript = await openapiTS(schema)
      log.info(`  ✅ Successfully converted schema to typescript definitions`)
      log.verbose('// types.ts', '\n'.padEnd(55, '-'), '\n' + openAPITypescript, '\n')
    } catch (error) {
      log.error(`Using schema: ${JSON.stringify(schema, null, 2)}`)
      log.error(`  ❌ Failed to convert openAPI schema json from downloaded schema`, error)
      return
    }

    let code: { models: string; endpoints: string; index: string }
    try {
      code = codegen(schema, openAPITypescript)
      log.info(`  ✅ Successfully generated model definitions and API methods`)
      log.verbose('// models.ts', '\n'.padEnd(55, '-'), '\n' + code.models, '\n')
      log.verbose('// endpoints.ts', '\n'.padEnd(55, '-'), '\n' + code.endpoints, '\n')
      log.verbose('// index.ts', '\n'.padEnd(55, '-'), '\n' + code.index)
    } catch (error) {
      log.error(`  ❌ Failed to generate code`, error)
      return
    }

    if (dryRun) {
      log.info(`✅ Successfully generated output for OpenAPI Schema from "${url}"`)
      return
    }

    saveFile(join(output, 'models.ts'), code.models)
    saveFile(join(output, 'endpoints.ts'), code.endpoints)
    saveFile(join(output, 'index.ts'), code.index)

    log.info(
      `✅ Successfully generated output for OpenAPI Schema from "${url}" and saved to "${output}"`,
    )
  })
  .parse()
