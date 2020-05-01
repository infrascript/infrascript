import {lint} from './lint'
import {run} from './run'

async function main() {
  switch (process.argv[2]) {
    case 'run':
      run()
      break

    case 'lint':
      lint()
      break

    default:
      throw new Error('Usage: safe-ts-node [run|lint]')
  }
}

main().catch((error) => {
  console.log(error.stack)
  process.exit(1)
})
