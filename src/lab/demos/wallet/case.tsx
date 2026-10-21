import {
	CASE_HEIGHT,
	CASE_RADIUS,
	CASE_TOP,
	CASE_WIDTH,
	LIP_HEIGHT,
	LIP_TOP,
	LIP_WIDTH,
} from './constants'

export function CaseBack() {
	return (
		<div
			className='absolute left-1/2 -translate-x-1/2 rounded-t-[10px] border border-b-0 border-foreground/18 bg-foreground/2.5'
			style={{ top: LIP_TOP, width: LIP_WIDTH, height: LIP_HEIGHT }}
			aria-hidden='true'
		/>
	)
}

export function CaseFront() {
	return (
		<div
			className='pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 bg-white/16 shadow-[inset_0_0_0_1px_rgb(17_17_17/0.28),inset_0_2px_0_rgb(255_255_255/0.9),inset_0_-14px_22px_-16px_rgb(17_17_17/0.25),0_14px_24px_-14px_rgb(17_17_17/0.26)]'
			style={{
				top: CASE_TOP,
				width: CASE_WIDTH,
				height: CASE_HEIGHT,
				borderRadius: CASE_RADIUS,
			}}
			aria-hidden='true'
		/>
	)
}
