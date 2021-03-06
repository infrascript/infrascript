// import * as pirates from 'pirates'

import {register as tsNodeRegister, Register} from 'ts-node'
import * as ts from 'typescript'
import {defaultCompilerOptions} from './typescript'

// function addHook(extension: string, options: Options): void {
//   pirates.addHook(
//     (code: string, filePath: string): string => {
//       const {code: transformedCode, sourceMap} = transform(code, {
//         ...options,
//         sourceMapOptions: {compiledFilename: filePath},
//         filePath,
//       })
//       const mapBase64 = Buffer.from(JSON.stringify(sourceMap)).toString('base64')
//       const suffix = `//# sourceMappingURL=data:application/json;charset=utf-8;base64,${mapBase64}`
//       return `${transformedCode}\n${suffix}`
//     },
//     {exts: [extension]},
//   )
// }

export function registerTSNode(compilerOptions: ts.CompilerOptions = defaultCompilerOptions): Register {
  return tsNodeRegister({
    transpileOnly: true,
    compilerOptions: {...compilerOptions, allowJs: true},
    preferTsExts: true,
  })
}
