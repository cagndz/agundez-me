import type { ComponentType } from 'react'
import { Dial } from './demos/dial'
import { Wallet } from './demos/wallet'
import { Inspect } from './demos/inspect'
import { Tooltip } from './demos/tooltip'
import { Receipt } from './demos/receipt'
import { Signature } from './demos/signature'

export const demos: Record<string, ComponentType | undefined> = {
	dial: Dial,
	wallet: Wallet,
	inspect: Inspect,
	tooltip: Tooltip,
	receipt: Receipt,
	signature: Signature,
}
