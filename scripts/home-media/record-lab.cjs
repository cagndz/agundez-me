// Records the real Lab demos at localhost:3000/lab?c=<demo>, one clip each,
// with a scripted pointer and a drawn cursor (headless Chrome has none).
const { createRequire } = require('module')
const req = createRequire(
	'/Users/charly/Developer/menubar-player-screenshot-kit/source/',
)
const puppeteer = req('puppeteer-core')
const fs = require('fs')
const out = process.argv[2]
const only = process.argv[3]
const cursor =
	'data:image/png;base64,' +
	fs
		.readFileSync(
			'/Users/charly/Developer/menubar-player-screenshot-kit/source/scene/cursor-arrow@4x.png',
		)
		.toString('base64')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

const SCRIPTS = {
	async dial(m) {
		await m.toEl('[aria-label="Dial"]', 0, 0, 700)
		await m.down()
		await m.by(-230, 4, 1100)
		await m.up()
		await wait(1000)
		await m.by(60, -4, 400)
		await m.down()
		await m.by(330, 0, 1200)
		await m.up()
		await wait(1100)
	},
	async wallet(m) {
		await m.toEl('[aria-label^="Card"][aria-label$="02"]', 10, -92, 800)
		await m.click()
		await wait(1700)
		await m.to(300, 660, 700)
		await m.click()
		await wait(900)
		await m.toEl('[aria-label^="Card"][aria-label$="01"]', 10, -92, 700)
		await m.click()
		await wait(1700)
		await m.to(320, 640, 600)
		await m.click()
		await wait(900)
	},
	async inspect(m) {
		const r = await m.page.evaluate(() => {
			const d = document.querySelector('[role=dialog]')
			const by = (t) =>
				[...d.querySelectorAll('div')]
					.filter((e) => e.textContent.trim() === t)
					.at(-1)
					.getBoundingClientRect()
			const a = by('you@inspect.com')
			const b = by('Subscribe')
			return {
				x: a.x,
				y: a.y - 30,
				width: a.width,
				height: b.bottom - a.y + 30,
			}
		})
		await m.to(r.x + 40, r.y + 30, 800)
		await m.to(r.x + r.width - 60, r.y + 75, 1200)
		await m.to(r.x + 120, r.y + r.height - 50, 1000)
		await m.to(r.x + r.width - 40, r.y + r.height - 25, 900)
		await m.click()
		await wait(1800)
		await m.click()
		await wait(800)
	},
	async tooltip(m) {
		await m.toEl('[aria-label="Lab status"]', 0, 0, 900)
		await wait(2300)
		await m.to(640, 640, 700)
		await wait(1000)
	},
}

;(async () => {
	process.env.PATH =
		'/Users/charly/Developer/menubar-player-screenshot-kit/source/node_modules/ffmpeg-static:' +
		process.env.PATH
	const b = await puppeteer.launch({
		executablePath:
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		headless: true,
		args: [
			'--hide-scrollbars',
			'--force-color-profile=srgb',
			'--force-device-scale-factor=2',
		],
	})
	for (const [name, script] of Object.entries(SCRIPTS)) {
		if (only && only !== name) continue
		const p = await b.newPage()
		await p.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 })
		await p.emulateMediaFeatures([
			{ name: 'prefers-reduced-motion', value: 'no-preference' },
		])
		await p.goto(`http://localhost:3000/lab?c=${name}`, {
			waitUntil: 'networkidle0',
		})
		await p.evaluate((src) => {
			const c = document.createElement('img')
			c.src = src
			c.style.cssText =
				'position:fixed;left:0;top:0;width:22px;z-index:2147483647;pointer-events:none;transform:translate(-200px,-200px);margin:-2px 0 0 -4px'
			document.body.append(c)
			addEventListener(
				'pointermove',
				(e) => (c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`),
				true,
			)
			// The dev overlay isn't part of the demo
			document.querySelector('nextjs-portal')?.remove()
		}, cursor)
		await wait(2200)
		let x = 640,
			y = 720
		await p.mouse.move(x, y)
		const m = {
			page: p,
			async rect(sel) {
				return p.evaluate((q) => {
					const r = document
						.querySelector('[role=dialog] ' + q)
						.getBoundingClientRect()
					return { x: r.x, y: r.y, width: r.width, height: r.height }
				}, sel)
			},
			async toEl(sel, dx, dy, ms) {
				const r = await this.rect(sel)
				await this.to(r.x + r.width / 2 + dx, r.y + r.height / 2 + dy, ms)
			},
			async by(dx, dy, ms) {
				await this.to(x + dx, y + dy, ms)
			},
			async to(tx, ty, ms) {
				const fx = x,
					fy = y,
					steps = Math.max(1, Math.round(ms / 16))
				for (let i = 1; i <= steps; i++) {
					const k = ease(i / steps)
					await p.mouse.move(fx + (tx - fx) * k, fy + (ty - fy) * k)
					await wait(16)
				}
				x = tx
				y = ty
			},
			down: () => p.mouse.down(),
			up: () => p.mouse.up(),
			async click() {
				await p.mouse.down()
				await wait(90)
				await p.mouse.up()
			},
		}
		const cdp = await p.createCDPSession()
		const dir = `${out}/${name}`
		fs.rmSync(dir, { recursive: true, force: true })
		fs.mkdirSync(dir, { recursive: true })
		const frames = []
		cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
			const file = `${dir}/${String(frames.length).padStart(5, '0')}.jpg`
			fs.writeFileSync(file, Buffer.from(data, 'base64'))
			frames.push([file, metadata.timestamp])
			cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {})
		})
		await cdp.send('Page.startScreencast', {
			format: 'jpeg',
			quality: 92,
			maxWidth: 2560,
			maxHeight: 1600,
			everyNthFrame: 1,
		})
		await wait(400)
		await script(m)
		await cdp.send('Page.stopScreencast')
		// Variable frame rate in, as an ffconcat list with each frame's duration
		let list = 'ffconcat version 1.0\n'
		frames.forEach(([f, t], i) => {
			const next = frames[i + 1]?.[1] ?? t + 1 / 60
			list += `file '${f}'\nduration ${(next - t).toFixed(4)}\n`
		})
		list += `file '${frames.at(-1)[0]}'\n`
		fs.writeFileSync(`${dir}.ffconcat`, list)
		console.log(
			name,
			frames.length,
			'frames',
			(frames.at(-1)[1] - frames[0][1]).toFixed(2),
			's',
		)
		await p.close()
		console.log('recorded', name)
	}
	await b.close()
})()
