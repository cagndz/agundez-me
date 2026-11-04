// Tokenises the sample with the real Silex theme and writes a scene page
// that types it out. window.__render(t) draws the scene at time t (s).
import { readFileSync, writeFileSync } from 'node:fs'
const { codeToTokens } =
	await import('/Users/charly/Developer/agundez-me/node_modules/shiki/dist/index.mjs')
const dir = new URL('.', import.meta.url).pathname
const theme = JSON.parse(
	readFileSync(
		'/Users/charly/Developer/silex/vscode/themes/silex-color-theme.json',
		'utf8',
	),
)
theme.name = 'silex'
const code = readFileSync(dir + 'code.txt', 'utf8').trimEnd()
const { tokens } = await codeToTokens(code, { lang: 'tsx', theme })
const lines = tokens.map((l) =>
	l.map((t) => [t.content, t.color, t.fontStyle ?? 0]),
)
const c = theme.colors
const font =
	'file:///Users/charly/Developer/agundez-me/src/assets/fonts/GeistMono-Regular.ttf'
const html = `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:GM;src:url(${font})}
html,body{margin:0;background:${c['editor.background']};overflow:hidden}
#ed{position:absolute;inset:0;padding:54px 0 0;font:14.5px/26px GM,monospace;color:${c['editor.foreground']};font-variant-ligatures:none}
.l{position:relative;height:26px;display:flex;white-space:pre}
.l.on{background:${c['editor.lineHighlightBackground']}}
.n{width:58px;padding-right:22px;text-align:right;color:${c['editorLineNumber.foreground']};flex:none;box-sizing:border-box}
.l.on .n{color:${c['editorLineNumber.activeForeground']}}
.cur{display:inline-block;width:2px;height:18px;margin-top:4px;background:${c['editorCursor.foreground']};vertical-align:top}
#fade{position:absolute;inset:0;background:${c['editor.background']};opacity:0}
</style><div id="ed"></div><div id="fade"></div><script>
const LINES=${JSON.stringify(lines)}
const ed=document.getElementById('ed'),fade=document.getElementById('fade')
// Each character's time: steady typing with a little deterministic jitter,
// a breath at each line end, indentation instantly.
let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647
const CPS=40;let t=0.55;const times=[]
LINES.forEach((line,li)=>{const text=line.map(x=>x[0]).join('');const lead=text.match(/^ */)[0].length;const row=[]
for(let i=0;i<text.length;i++){if(i<lead){row.push(t);continue}t+=(1/CPS)*(0.55+rnd()*0.9);if(text[i]===' ')t+=0.01;row.push(t)}
times.push(row);t+=text.length?0.16:0.08})
window.__duration=t+1.6+0.45
// A line becomes the active one when the previous line is finished
const starts=[];let prevEnd=0
times.forEach((row,li)=>{starts.push(li===0?0:prevEnd+0.08);if(row.length)prevEnd=row.at(-1)})
const end=prevEnd
window.__render=(now)=>{let active=0
for(let li=0;li<LINES.length;li++)if(now>=starts[li])active=li
let html=''
for(let li=0;li<=active;li++){const row=times[li];const shown=li<active?row.length:row.filter(x=>x<=now).length
let k=0,out='';for(const [s,color,fs] of LINES[li]){if(k>=shown)break;const part=s.slice(0,shown-k);k+=s.length;out+='<span style="color:'+color+(fs&1?';font-style:italic':'')+'">'+part.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span>'}
const blink=now>end+0.3?(Math.floor((now-end-0.3)/0.53)%2===1):true
if(li===active&&blink)out+='<span class="cur"></span>'
html+='<div class="l'+(li===active?' on':'')+'"><span class="n">'+(li+1)+'</span>'+out+'</div>'}
ed.innerHTML=html;fade.style.opacity=Math.max(0,Math.min(1,(now-(window.__duration-0.45))/0.45))}
window.__render(0)
</script>`
writeFileSync(dir + 'scene.html', html)
console.log('lines', lines.length)
