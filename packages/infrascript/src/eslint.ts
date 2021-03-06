import lintConfig from '@infrascript/config-eslint'
import chalk from 'chalk'
import {CLIEngine} from 'eslint'
import path from 'path'
import {DiagnosticMessage} from './diagnostics'
import {findConfigFile} from './typescript'

export function getESLint(): CLIEngine {
  const configPath = findConfigFile()
  const baseConfig =
    configPath !== undefined
      ? {
          ...lintConfig,
          parserOptions: {
            ...(lintConfig.parserOptions ?? {}),
            tsconfigRootDir: process.cwd(),
            project: [configPath],
          },
        }
      : lintConfig

  const cli = new CLIEngine({
    baseConfig,
    cwd: process.cwd(),
    extensions: ['.ts'],
    resolvePluginsRelativeTo: require.resolve('@infrascript/config-eslint'),
    useEslintrc: false,
  })

  return cli
}

export function lintFiles(files: string[]): DiagnosticMessage[] {
  const cli = getESLint()
  const results = cli.executeOnFiles([...files])
  return lintResultsToDiagnosticMessages(results.results)
}

function lintResultsToDiagnosticMessages(results: CLIEngine.LintResult[]): DiagnosticMessage[] {
  return results.flatMap((result) => {
    const relativePath = path.relative(process.cwd(), result.filePath)
    const sourceLines = (result.source ?? '').split('\n')

    return result.messages.map((message) => {
      const severity =
        message.severity === 2
          ? chalk.red('error')
          : message.severity === 1
          ? chalk.yellow('warning')
          : chalk.gray('info')

      // Sometimes the line is undefined, like if there's an ESLint error
      // which the types don't account for
      if ((message.line as number | undefined) === undefined) {
        return {
          file: result.filePath,
          error: message.severity === 2,
          message: `${chalk.cyan(relativePath)} - ${severity} ${message.message}`,
        }
      }

      const firstLine = message.line
      const lastLine = message.endLine ?? message.line
      const gutterWidth = String(lastLine).length
      const relevantSourceLine = sourceLines[firstLine - 1]
      const lineNumber = String(firstLine).padStart(gutterWidth, ' ')
      const emptyGutter = String('').padStart(gutterWidth, ' ')

      const lastCharForLine =
        (message.line === message.endLine ? message.endColumn : undefined) ?? relevantSourceLine.length
      const prefix = relevantSourceLine.slice(0, message.column - 1).replace(/\S/g, ' ')
      const squiggle = relevantSourceLine.slice(message.column - 1, lastCharForLine - 1).replace(/./g, '~')

      const pos = `${chalk.cyan(relativePath)}:${chalk.yellow(message.line)}:${chalk.yellow(message.column)}`
      return {
        file: result.filePath,
        line: message.line,
        column: message.column,
        error: message.severity === 2,
        message: `${pos} - ${severity} ${message.message} ${chalk.gray(message.ruleId)}

${chalk.black.bgWhite(lineNumber)} ${relevantSourceLine}
${chalk.black.bgWhite(emptyGutter)} ${prefix}${(message.severity === 2 ? chalk.red : chalk.cyan)(squiggle)}`,
      }
    })
  })
}
