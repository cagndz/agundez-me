export function getCellRect(slug: string): DOMRect | null {
	const cell = document.querySelector(`[data-lab-cell="${slug}"]`)
	if (!cell) return null
	return cell.getBoundingClientRect()
}

// Duración del viaje (ms): base + un poco más por cada px de distancia.
// Una celda cercana se cruza en ~300 ms; una lejana, en ~450 ms.
const DURATION_BASE = 280
const DURATION_PER_PX = 0.35
const DURATION_MAX = 520

/**
 * Escribe en el popup las variables CSS que describen el estado "ausente" del
 * escenario (la tarjeta del demo): desplazado y escalado hasta coincidir con la
 * celda de origen, más la duración del viaje.
 * Las variables se heredan, así que las lee .lab-stage (ver lab-modal.css).
 * Si no hay celda, deja un efecto genérico desde el centro.
 */
export function applyOrigin(popup: HTMLElement, slug: string | undefined) {
	const stage = popup.querySelector<HTMLElement>('[data-lab-stage]')
	const rect = slug ? getCellRect(slug) : null

	if (!rect || !stage) {
		popup.style.setProperty('--origin-x', '0px')
		popup.style.setProperty('--origin-y', '0px')
		popup.style.setProperty('--origin-s', '0.95')
		popup.style.setProperty('--origin-duration', '300ms')
		return
	}

	// El popup no tiene transform, así que su rect es el de reposo.
	// offsetLeft/offsetTop/offsetWidth del escenario tampoco incluyen su transform.
	const popupRect = popup.getBoundingClientRect()
	const stageCenterX = popupRect.left + stage.offsetLeft + stage.offsetWidth / 2
	const stageCenterY = popupRect.top + stage.offsetTop + stage.offsetHeight / 2

	const dx = rect.left + rect.width / 2 - stageCenterX
	const dy = rect.top + rect.height / 2 - stageCenterY
	const s = rect.width / stage.offsetWidth

	const distance = Math.hypot(dx, dy)
	const duration = Math.min(
		DURATION_MAX,
		DURATION_BASE + distance * DURATION_PER_PX,
	)

	popup.style.setProperty('--origin-x', `${dx}px`)
	popup.style.setProperty('--origin-y', `${dy}px`)
	popup.style.setProperty('--origin-s', `${s}`)
	popup.style.setProperty('--origin-duration', `${Math.round(duration)}ms`)
}

/**
 * Igual que applyOrigin, pero sin que el navegador anime el cambio.
 * Se usa al abrir: leer medidas fuerza al navegador a calcular estilos, y si
 * eso ocurre antes de que existan las variables, anima desde "none" hacia el
 * estado inicial (al revés). Con las transiciones apagadas (data-no-transition,
 * ver lab-modal.css), el estado inicial se fija sin animar y la transición real
 * arranca desde él.
 */
export function applyOriginWithoutTransition(
	popup: HTMLElement,
	slug: string | undefined,
) {
	popup.setAttribute('data-no-transition', '')
	applyOrigin(popup, slug)
	void popup.offsetWidth // fuerza el cálculo de estilos con las variables ya puestas
	popup.removeAttribute('data-no-transition')
}
