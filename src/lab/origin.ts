export function getCellRect(slug: string): DOMRect | null {
	const cell = document.querySelector(`[data-lab-cell="${slug}"]`)
	if (!cell) return null
	return cell.getBoundingClientRect()
}

/**
 * Escribe en el popup las variables CSS que describen su estado "ausente":
 * desplazado y encogido hasta coincidir con la celda de origen.
 * Si no hay celda, deja un efecto genérico desde el centro.
 */
export function applyOrigin(popup: HTMLElement, slug: string | undefined) {
	const rect = slug ? getCellRect(slug) : null

	if (!rect) {
		popup.style.setProperty('--origin-x', '0px')
		popup.style.setProperty('--origin-y', '0px')
		popup.style.setProperty('--origin-s', '0.95')
		return
	}

	const viewportCenterX = document.documentElement.clientWidth / 2
	const viewportCenterY = document.documentElement.clientHeight / 2
	const dx = rect.left + rect.width / 2 - viewportCenterX
	const dy = rect.top + rect.height / 2 - viewportCenterY
	const s = rect.width / popup.offsetWidth

	popup.style.setProperty('--origin-x', `${dx}px`)
	popup.style.setProperty('--origin-y', `${dy}px`)
	popup.style.setProperty('--origin-s', `${s}`)
}

/**
 * Igual que applyOrigin, pero sin que el navegador anime el cambio.
 * Se usa al abrir: leer medidas fuerza al navegador a calcular estilos, y si
 * eso ocurre antes de que existan las variables, anima desde "none" hacia el
 * estado inicial (al revés). Con la transición apagada, el estado inicial se
 * fija sin animar y la transición real arranca desde él.
 */
export function applyOriginWithoutTransition(
	popup: HTMLElement,
	slug: string | undefined,
) {
	popup.style.transition = 'none'
	applyOrigin(popup, slug)
	void popup.offsetWidth // fuerza el cálculo de estilos con las variables ya puestas
	popup.style.transition = ''
}
