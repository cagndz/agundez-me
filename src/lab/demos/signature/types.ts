export type Point = { x: number; y: number }
export type Stroke = Point[]

// empty → drawing → pending (the pen is up, the countdown runs) → confirming
// (the retrace and the fold) → signed
export type Phase = 'empty' | 'drawing' | 'pending' | 'confirming' | 'signed'
