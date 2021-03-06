import {Scheduler} from './Scheduler'
import {Procedure} from './Procedure'

export async function reconcile(procedures: Procedure[]): Promise<void> {
  const scheduler = new Scheduler()
  console.log('starting reconciliation loop')
  // eslint-disable-next-line no-constant-condition,@typescript-eslint/no-unnecessary-condition
  while (true) {
    const complete = await scheduler.execute(procedures)
    if (!complete) {
      console.warn('reconciliation not finished...')
    } else {
      console.info('scheduler complete - exit')
      break
    }
  }
}
