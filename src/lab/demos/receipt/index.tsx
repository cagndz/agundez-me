'use client'

import { SIZE } from './constants'
import { Showroom } from './showroom'
import { TearMachine } from './tear'

export function Receipt() {
	return (
		<div className='relative' style={SIZE}>
			<TearMachine menu={Showroom} />
		</div>
	)
}
