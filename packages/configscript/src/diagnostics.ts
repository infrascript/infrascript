export type DiagnosticMessage = {
  readonly file: string
  readonly position?: {
    readonly line: number
    readonly column: number
  }
  readonly error: boolean
  readonly message: string
}

/**
 * Sorts a list of diagnostic messages generated from arbitrary linters or type checkers by source file, line, and column
 *
 * @param messages Array of diagnostic messages
 */
export function sortDiagnosticMessages(messages: readonly DiagnosticMessage[]): readonly DiagnosticMessage[] {
  return [...messages].sort((a, b) => {
    if (a.position === undefined && b.position !== undefined) {
      return 1
    } else if (a.position !== undefined && b.position === undefined) {
      return -1
    } else if (a.position !== undefined && b.position !== undefined) {
      const filenameComparison = a.file.localeCompare(b.file)
      if (filenameComparison !== 0) {
        return filenameComparison
      }
      const lineDifference = a.position.line - b.position.line
      return lineDifference === 0 ? a.position.column - b.position.column : lineDifference
    }
    return 0
  })
}
