import type { ComponentType } from 'react'
import { HoldToConfirm } from './demos/hold-to-confirm'
import Dial from './demos/dial'

export const demos: Record<string, ComponentType | undefined> = {
	'hold-to-confirm': HoldToConfirm,
	dial: Dial,
}
