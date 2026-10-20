export const MIN = 0
export const MAX = 100
export const INITIAL = 50
export const PX_PER_UNIT = 12.5
export const TRAVEL = (MAX - MIN) * PX_PER_UNIT
export const BAND_WIDTH = TRAVEL + 1
export const INITIAL_OFFSET_PX = (-INITIAL + MIN) * PX_PER_UNIT
export const RADIUS = 300
export const WHEEL_TOP = 40
export const DEGREES_PER_UNIT = 2.4
export const UNITS = Array.from({ length: MAX - MIN + 1 }, (_, i) => MIN + i)
