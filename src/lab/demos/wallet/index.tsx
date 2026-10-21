import { CaseBack, CaseFront } from './case'
import { STAGE_HEIGHT, STAGE_WIDTH } from './constants'

export function Wallet() {
	return (
		<div
			className='relative'
			style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
		>
			<CaseBack />
			<CaseFront />
		</div>
	)
}
