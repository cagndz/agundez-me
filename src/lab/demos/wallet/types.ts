export type WalletCardTone = 'dark' | 'light' | 'accent'

export type WalletCardData = {
	id: string
	title: string
	description: string
	code: string
	tone: WalletCardTone
}
