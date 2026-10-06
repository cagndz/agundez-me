import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import DemoLoading from './demo-loading'

export const demos: Record<string, ComponentType | undefined> = {
	'hold-to-confirm': dynamic(() => import('./demos/hold-to-confirm'), {
		loading: DemoLoading,
	}),
}
