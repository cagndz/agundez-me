// Frame-by-frame capture of a scene page that exposes __render(t) and __duration.
//   node capture.cjs scene.html out-dir width height fps
const { createRequire } = require('module')
const req = createRequire(
	'/Users/charly/Developer/menubar-player-screenshot-kit/source/',
)
const puppeteer = req('puppeteer-core')
const fs = require('fs')
const [file, out, w, h, fps] = process.argv.slice(2)
;(async () => {
	fs.rmSync(out, { recursive: true, force: true })
	fs.mkdirSync(out, { recursive: true })
	const b = await puppeteer.launch({
		executablePath:
			'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		headless: true,
		args: [
			'--hide-scrollbars',
			'--force-color-profile=srgb',
			'--allow-file-access-from-files',
			'--font-render-hinting=none',
		],
	})
	const p = await b.newPage()
	await p.setViewport({ width: +w, height: +h, deviceScaleFactor: 2 })
	await p.goto('file://' + require('path').resolve(file), { waitUntil: 'load' })
	await p.evaluate(() => document.fonts.ready)
	const dur = await p.evaluate(() => window.__duration)
	const n = Math.round(dur * fps)
	for (let i = 0; i < n; i++) {
		await p.evaluate((t) => window.__render(t), i / fps)
		await p.screenshot({ path: `${out}/${String(i).padStart(5, '0')}.png` })
	}
	console.log('frames', n, 'duration', dur.toFixed(2))
	await b.close()
})()
