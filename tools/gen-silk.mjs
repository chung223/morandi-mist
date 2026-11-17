// 產生「光絲流」背景 SVG：兩束極細光絲，一束往左流、一束往右流，波長不同；左右兩端淡出；
// 再加稀疏的極細粒子由左往右漂。
//
// 省資源的做法「動一陣、停一陣」：所有東西一起流動 FLOW 秒（起步和停下都是緩的），
// 再一起完全靜止 REST 秒。靜止時畫面沒有任何變化，就完全不用重畫、不耗資源。
// 一輪是 WINDOWS 次「流動＋靜止」，每條光絲每一輪剛好走完整數個波長，所以接回開頭看不出接縫。
// 同一束的光絲分成幾組，每組在每次流動走的距離不同，兩束又反方向，所以形狀會一直變化。
//
// 用法：node tools/gen-silk.mjs <輸出的 svg 檔>
// 位置用固定亂數算，每次產生結果都一樣；改下面的參數後重新產生，再整段貼回 hooks/register.tsx 的 SCENE_SVG。
import fs from 'node:fs'

// ── 可以調的參數 ─────────────────────────────
const FLOW = 20 // 每次流動幾秒
const REST = 20 // 每次靜止幾秒（靜止時不耗資源）
const WINDOWS = 4 // 一輪有幾次「流動＋靜止」
const SILK = {
  lines: 22, // 光絲條數：越多越細緻，但每次重畫越重
  width: 1.1,
  top: 300, // 整束最上面那條的基準高度（畫面高 1000）
  spread: 380,
  amp: [170, 90], // 主波浪幅度：中間那條最大 = 170 + 90
  ripple: 45,
  step: 25, // 取樣間距：越小曲線越滑
  groups: 6, // 分成幾組各走各的距離
}
// 第二束：往右流、波長是第一束的 2/3，條數少、比較淡，當作交疊的底紋
const SILK2 = { lines: 12, width: 0.9, top: 360, spread: 300, amp: [110, 70], ripple: 30, step: 40, groups: 4 }
const DUST = [
  // 稀疏粒子三層：遠的細、慢、淡，近的稍粗、稍快、清楚；turns 是一輪走幾個畫面寬
  { n: 40, turns: 1, op: 0.4, sw: 1, l: [10, 16], bob: 8 },
  { n: 26, turns: 1, op: 0.6, sw: 1.4, l: [16, 24], bob: 10 },
  { n: 14, turns: 2, op: 0.8, sw: 1.8, l: [24, 36], bob: 12 },
]
// 湖藍 → 鼠尾草綠 → 沙 → 乾燥玫瑰 → 灰紫（淺色、深色各一組）
const LIGHT = ['#4f8792', '#6b8f5e', '#b0915c', '#a8716c', '#7a68a0']
const DARK = ['#8fb5bd', '#9dbc8e', '#d4b783', '#d29a94', '#b3a3d1']
// ──────────────────────────────────────────

const CYCLE = WINDOWS * (FLOW + REST)
// 動畫用 SVG 內建的 <animateTransform>（SMIL）而不是 CSS：CSS 動畫只要還在跑，就算數值沒變也會每格重畫；
// SMIL 的每段動作播完就「凍結」在終點，到下一段開始前畫面完全不動、不重畫，靜止時才真的不耗資源。
// 注意：SMIL 不理會系統的「減少動態效果」設定。

let seed = 7
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const vars = pal => pal.map((c, i) => `--k${i}:${c}`).join(';')
const SPLINE = 'calcMode="spline" keyTimes="0;1" keySplines=".45 0 .55 1"' // 緩起緩停
const SWAY = 'calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"'

// 往一個方向流：一輪總共走 total，第 w 次流動走 share(w)（加起來剛好是 1）。
// 每次流動是一個動畫元素，播完凍結在終點；每 CYCLE 秒重新開始一次。
let uid = 0
const flow = (total, share) => {
  let x = 0
  let a = ''
  for (let w = 0; w < WINDOWS; w++) {
    const id = `f${uid++}`
    const nx = x + share(w)
    a += `<animateTransform id="${id}" attributeName="transform" type="translate" from="${(total * x).toFixed(1)} 0" to="${(total * nx).toFixed(1)} 0" dur="${FLOW}s" begin="${w * (FLOW + REST)}s;${id}.end+${CYCLE - FLOW}s" ${SPLINE} fill="freeze"/>`
    x = nx
  }
  return a
}
// 每次流動時上下起伏一次（去了又回來），播完回到原位
const sway = (dy) => {
  const id = `f${uid++}`
  return `<animateTransform id="${id}" attributeName="transform" type="translate" values="0 0;0 ${dy};0 0" dur="${FLOW}s" begin="0s;${id}.end+${REST}s" ${SWAY} fill="freeze"/>`
}
// 每組每次走的比例：平均 1/WINDOWS，再依組別錯開 ±16%，加起來還是剛好 1
const shareOf = (g, groups, shift = 0) => w => 1 / WINDOWS + 0.04 * Math.sin((2 * Math.PI * w) / WINDOWS + (2 * Math.PI * g) / groups + shift)

const P1 = 1600 // 第一束波長
const P2 = 3200 / 3 // 第二束波長

// 第一束：路徑 0～3200（兩個波長），一輪往左走一個波長；同一組的線放在同一個 <g>，一起動
const groupsA = Array.from({ length: SILK.groups }, () => '')
for (let i = 0; i < SILK.lines; i++) {
  const t = i / (SILK.lines - 1)
  const base = SILK.top + t * SILK.spread
  const amp = SILK.amp[0] + SILK.amp[1] * Math.sin(t * Math.PI)
  const ph = t * 1.9
  let d = ''
  for (let x = 0; x <= 3200; x += SILK.step) {
    const y = base + amp * Math.sin((x / P1) * Math.PI * 2 + ph) + SILK.ripple * Math.sin((x / (P1 / 2)) * Math.PI * 2 + ph * 1.6)
    d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(0)
  }
  const k = Math.min(4, Math.floor(t * 5))
  const op = (0.28 + 0.55 * Math.sin(t * Math.PI)).toFixed(2)
  groupsA[i % SILK.groups] += `<path class="s k${k}" d="${d}" opacity="${op}"/>`
}
const silk = groupsA.map((p, g) => `<g>${flow(-P1, shareOf(g, SILK.groups))}${p}</g>`).join('')

// 第二束：路徑 -3200～1600，一輪往右走兩個波長
const groupsB = Array.from({ length: SILK2.groups }, () => '')
for (let i = 0; i < SILK2.lines; i++) {
  const t = i / (SILK2.lines - 1)
  const base = SILK2.top + t * SILK2.spread
  const amp = SILK2.amp[0] + SILK2.amp[1] * Math.sin(t * Math.PI)
  const ph = -t * 1.4 + 2.2
  let d = ''
  for (let x = -3200; x <= 1600; x += SILK2.step) {
    const y = base + amp * Math.sin((x / P2) * Math.PI * 2 + ph) + SILK2.ripple * Math.sin((x / (P2 / 2)) * Math.PI * 2 - ph)
    d += (x === -3200 ? 'M' : 'L') + x + ' ' + y.toFixed(0)
  }
  const k = 4 - Math.min(4, Math.floor(t * 5)) // 顏色順序和第一束相反：上灰紫、下湖藍
  const op = (0.18 + 0.4 * Math.sin(t * Math.PI)).toFixed(2)
  groupsB[i % SILK2.groups] += `<path class="s2 k${k}" d="${d}" opacity="${op}"/>`
}
const silk2 = groupsB.map((p, g) => `<g>${flow(2 * P2, shareOf(g, SILK2.groups, 1))}${p}</g>`).join('')

// 稀疏粒子：每層複製到左邊（近的那層多複製一份），一輪往右走 turns 個畫面寬，流動時也輕輕上下飄
let dust = ''
DUST.forEach(L => {
  let ps = ''
  for (let i = 0; i < L.n; i++) {
    const x = rnd() * 1600
    const y = 40 + rnd() * 920
    const len = L.l[0] + rnd() * (L.l[1] - L.l[0])
    const k = Math.min(4, Math.floor((y / 1000) * 5))
    ps += `<path class="k${k}" d="M${x.toFixed(0)} ${y.toFixed(0)}h${len.toFixed(0)}"/>`
  }
  let copies = `<g>${ps}</g>`
  for (let c = 1; c <= L.turns; c++) copies += `<g transform="translate(${-1600 * c} 0)">${ps}</g>`
  dust += `<g>${sway(-L.bob)}<g opacity="${L.op}" stroke-width="${L.sw}">${flow(1600 * L.turns, () => 1 / WINDOWS)}${copies}</g></g>`
})

const style = `
svg{--bg:#e3e8e6;${vars(LIGHT)}}
@media (prefers-color-scheme:dark){svg{--bg:#171d20;${vars(DARK)}}}
.bg{fill:var(--bg)}
path{fill:none;stroke-linecap:round}
${LIGHT.map((_, i) => `.k${i}{stroke:var(--k${i})}`).join('')}
.s{stroke-width:${SILK.width}}
.s2{stroke-width:${SILK2.width}}
.fade0{stop-color:#fff;stop-opacity:0}.fade1{stop-color:#fff;stop-opacity:1}
`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>${style}</style>
<defs>
<linearGradient id="edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" class="fade0"/><stop offset=".22" class="fade1"/><stop offset=".78" class="fade1"/><stop offset="1" class="fade0"/></linearGradient>
<mask id="ends" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1400"><rect x="-200" y="-200" width="2000" height="1400" fill="url(#edge)"/></mask>
</defs>
<rect class="bg" x="-200" y="-200" width="2000" height="1400"/>
<g mask="url(#ends)"><g>${sway(-20)}${silk2}</g><g>${sway(24)}${silk}</g></g>
${dust}
</svg>`

if (/[`\\]|\$\{/.test(svg)) throw new Error('SVG 裡有會弄壞樣板字串的字元')
if (svg.length > 120000) throw new Error(`SVG 太大（${svg.length} 字元），桌面版上限 131072`)
fs.writeFileSync(process.argv[2], svg)
console.log('SVG 字元數', svg.length, '｜一輪', CYCLE, '秒：流動', FLOW, '秒、靜止', REST, '秒 ×', WINDOWS)
