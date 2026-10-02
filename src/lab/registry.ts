import type { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import DemoLoading from './demo-loading'

export const demos: Record<string, ComponentType | undefined> = {
	'empty-001': dynamic(() => import('./demos/placeholder'), {
		loading: DemoLoading,
	}),
}
