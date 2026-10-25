import type { ComponentType } from 'react'
import { Dial } from './demos/dial'
import { Wallet } from './demos/wallet'

export const demos: Record<string, ComponentType | undefined> = {
	dial: Dial,
	wallet: Wallet,
}
