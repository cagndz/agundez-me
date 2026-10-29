import type { ComponentType } from 'react'
import { Dial } from './demos/dial'
import { Wallet } from './demos/wallet'
import { Inspect } from './demos/inspect'
import { Tooltip } from './demos/tooltip'

export const demos: Record<string, ComponentType | undefined> = {
	dial: Dial,
	wallet: Wallet,
	inspect: Inspect,
	tooltip: Tooltip,
}
