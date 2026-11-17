// 產生「光絲流」背景 SVG：幾十條極細光絲疊成一條絲綢，大幅度橫向起伏、緩慢流動，
// 左右兩端淡出；再加稀疏的極細粒子由左往右漂。
// 用法：node tools/gen-silk.mjs <輸出的 svg 檔>
// 位置用固定亂數算，每次產生結果都一樣；改下面的參數後重新產生，再整段貼回 hooks/register.tsx 的 SCENE_SVG。
import fs from 'node:fs'

// ── 可以調的參數 ─────────────────────────────
const SILK = {
  lines: 44, // 光絲條數：越多越細緻
  width: 1.1, // 光絲粗細
  top: 300, // 整束光絲最上面那條的基準高度（畫面高 1000）
  spread: 380, // 最上面到最下面的距離
  amp: [170, 90], // 主波浪幅度：中間那條最大 = 170 + 90
  ripple: 45, // 疊在主波浪上的小波幅度
  step: 25, // 取樣間距：越小曲線越滑
  speed: [64, 1.0], // 流過一段的秒數：第一條 64 秒，之後每條多 1.0 秒，所以會慢慢交錯
  breathe: 18, // 整束上下起伏一次的秒數
}
const DUST = [
  // 稀疏粒子三層：遠的細、慢、淡，近的稍粗、稍快、清楚
  { n: 40, dur: 140, op: 0.4, sw: 1, l: [10, 16] },
  { n: 26, dur: 100, op: 0.6, sw: 1.4, l: [16, 24] },
  { n: 14, dur: 70, op: 0.8, sw: 1.8, l: [24, 36] },
]
// 湖藍 → 鼠尾草綠 → 沙 → 乾燥玫瑰 → 灰紫（淺色、深色各一組）
const LIGHT = ['#4f8792', '#6b8f5e', '#b0915c', '#a8716c', '#7a68a0']
const DARK = ['#8fb5bd', '#9dbc8e', '#d4b783', '#d29a94', '#b3a3d1']
// ──────────────────────────────────────────

let seed = 7
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const vars = pal => pal.map((c, i) => `--k${i}:${c}`).join(';')

// 光絲：每條是兩個週期寬（3200）的波，往左移 1600 就無縫接回
let silk = ''
for (let i = 0; i < SILK.lines; i++) {
  const t = i / (SILK.lines - 1)
  const base = SILK.top + t * SILK.spread
  const amp = SILK.amp[0] + SILK.amp[1] * Math.sin(t * Math.PI)
  const ph = t * 1.9
  let d = ''
  for (let x = 0; x <= 3200; x += SILK.step) {
    const y = base + amp * Math.sin((x / 1600) * Math.PI * 2 + ph) + SILK.ripple * Math.sin((x / 800) * Math.PI * 2 + ph * 1.6)
    d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(0)
  }
  const k = Math.min(4, Math.floor(t * 5))
  const op = (0.28 + 0.55 * Math.sin(t * Math.PI)).toFixed(2)
  const dur = (SILK.speed[0] + i * SILK.speed[1]).toFixed(1)
  silk += `<path class="s k${k}" d="${d}" style="opacity:${op};animation-duration:${dur}s"/>`
}

// 稀疏粒子：每層複製一份在左邊，往右移 1600 無縫循環
let dust = ''
DUST.forEach((L, li) => {
  let ps = ''
  for (let i = 0; i < L.n; i++) {
    const x = rnd() * 1600
    const y = 40 + rnd() * 920
    const len = L.l[0] + rnd() * (L.l[1] - L.l[0])
    const k = Math.min(4, Math.floor((y / 1000) * 5))
    ps += `<path class="k${k}" d="M${x.toFixed(0)} ${y.toFixed(0)}h${len.toFixed(0)}"/>`
  }
  dust += `<g class="bob" style="animation-duration:${16 + li * 4}s;animation-delay:${-li * 5}s"><g class="flow" style="animation-duration:${L.dur}s;opacity:${L.op};stroke-width:${L.sw}"><g>${ps}</g><g transform="translate(-1600 0)">${ps}</g></g></g>`
})

const css = `
svg{--bg:#e3e8e6;${vars(LIGHT)}}
@media (prefers-color-scheme:dark){svg{--bg:#171d20;${vars(DARK)}}}
.bg{fill:var(--bg)}
path{fill:none;stroke-linecap:round}
${LIGHT.map((_, i) => `.k${i}{stroke:var(--k${i})}`).join('')}
.s{stroke-width:${SILK.width};animation:silk 64s linear infinite}
.silk{transform-origin:800px 500px;animation:breathe ${SILK.breathe}s cubic-bezier(.45,0,.55,1) infinite}
.bob{animation:bob 16s cubic-bezier(.45,0,.55,1) infinite}
.flow{animation:flowR 100s linear infinite}
.fade0{stop-color:#fff;stop-opacity:0}.fade1{stop-color:#fff;stop-opacity:1}
@keyframes silk{from{transform:translateX(0)}to{transform:translateX(-1600px)}}
@keyframes breathe{50%{transform:translateY(24px) scaleY(1.12)}}
@keyframes flowR{from{transform:translateX(0)}to{transform:translateX(1600px)}}
@keyframes bob{50%{transform:translateY(-10px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>${css}</style>
<defs>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="fade0"/><stop offset=".22" class="fade1"/><stop offset=".78" class="fade1"/><stop offset="1" class="fade0"/></linearGradient>
<mask id="ends" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400"><rect x="-200" y="-200" width="2000" height="1400" fill="url(#edge)"/></mask>
</defs>
<rect class="bg" x="-200" y="-200" width="2000" height="1400"/>
<g mask="url(#ends)"><g class="silk">${silk}</g></g>
${dust}
</svg>`

if (/[`\\]|\$\{/.test(svg)) throw new Error('SVG 裡有會弄壞樣板字串的字元')
if (svg.length > 120000) throw new Error(`SVG 太大（${svg.length} 字元），桌面版上限 131072`)
fs.writeFileSync(process.argv[2], svg)
console.log('SVG 字元數', svg.length)
