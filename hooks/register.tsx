import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// 霧光：莫蘭迪色系的未來感主題。
// 白天像晨霧裡的玻璃面板（霧灰綠底、霧湖藍強調），
// 夜晚像霧中的儀表板微光（深藍灰底、柔和的湖藍與灰紫）。
// 顏色都壓低彩度，對比留給文字，眼睛看久不累。

// 強調色：霧湖藍；紅、綠、黃保留原本的意思，只是調成莫蘭迪的灰調。
const ROLES = {
  accent: '#5a8f9a', // 霧湖藍
  danger: '#bb6157', // 乾燥玫瑰紅
  success: '#6f9d63', // 鼠尾草綠
  warning: { seed: '#c08f4a', fillShade: 450 }, // 赭黃，按鈕用深一階，不刺眼
  pro: '#8a78aa', // 灰紫
} as const

const { theme, problems } = makeColors({
  label: '霧光',
  roles: ROLES,
  light: {
    gray: {
      anchors: {
        'surface-0': '#e6eae8', // 頁面：霧灰綠
        'surface-1': '#edf0ee', // 卡片
        'surface-2': '#f5f7f5', // 面板
        'text-primary': '#243036', // 深石板藍
        'text-secondary': '#45525a',
        'text-muted': '#56636a',
      },
    },
    git: {
      added: '#4c7a45',
      removed: '#a85148',
      modified: '#946f2e',
      merged: '#735f93',
      closed: '#a85148',
      conflicting: '#9d5c2a',
      draft: '#5d6870',
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1a2023', // 頁面：夜霧藍灰
        'surface-1': '#20272a',
        'surface-2': '#262e31',
        'surface-3': '#293134', // 選單：貼近頁面，灰字才看得清楚
        'text-primary': '#e5e9e6', // 帶一點綠的米白，不用純白
        'text-secondary': '#bec6c4',
        'text-muted': '#99a3a2',
      },
    },
    // 深色模式的綠字提亮一階，在面板上才讀得清楚
    roles: { ...ROLES, success: { seed: '#6f9d63', stops: { 400: '#8fbb80' } } },
    git: {
      added: '#98bb8a',
      removed: '#e0968d',
      modified: '#d8b47c',
      merged: '#bbaad6',
      closed: '#e0968d',
      conflicting: '#e0a273',
      draft: '#a3adb2',
    },
  },
})

// 動態背景「霧光儀表」：A 霧中極光＋C 資料微光。
// 底層三團霧光慢慢飄（40～64 秒一趟）；四角有細框線，左右兩側有細光落下，
// 右上角光環慢轉（90 秒一圈）。中間和下方留給文字與輸入框。
// 顏色跟著系統的淺色、深色切換；系統開了「減少動態效果」就停住不動。
const SCENE_NAME = 'mist-hud'

const SCENE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
svg{--bg:#dde4e2;--a:#5a8f9a;--p:#8a78aa;--r:#bb8a84;--ln:#4f8792;--ao:.8;--po:.72;--ro:.55;--lo:.62;--so:.55}
@media (prefers-color-scheme:dark){svg{--bg:#151b1e;--a:#4f8d99;--p:#8a76ad;--r:#a8716c;--ln:#8fb5bd;--ao:.62;--po:.58;--ro:.4;--lo:.55;--so:.5}}
.bg{fill:var(--bg)}
.fa{stop-color:var(--a);stop-opacity:var(--ao)}.fp{stop-color:var(--p);stop-opacity:var(--po)}.fr{stop-color:var(--r);stop-opacity:var(--ro)}
.f0a{stop-color:var(--a);stop-opacity:0}.f0p{stop-color:var(--p);stop-opacity:0}.f0r{stop-color:var(--r);stop-opacity:0}
.br{fill:none;stroke:var(--ln);stroke-opacity:var(--lo);stroke-width:4;stroke-linecap:round}
.st{stroke:var(--ln);stroke-width:5;stroke-linecap:round;opacity:var(--so)}.st.p{stroke:var(--p)}
.ring{fill:none;stroke:var(--ln);stroke-opacity:var(--lo);stroke-width:4;stroke-dasharray:40 18 6 18}
.ring2{fill:none;stroke:var(--p);stroke-opacity:var(--lo);stroke-width:3}
.dot{fill:var(--ln)}
.bars{fill:var(--ln);fill-opacity:var(--lo)}
@keyframes d1{to{transform:translate(170px,110px)}}
@keyframes d2{to{transform:translate(-190px,-90px)}}
@keyframes d3{to{transform:translate(-110px,130px)}}
@keyframes rain{from{transform:translateY(-160px)}to{transform:translateY(1100px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{50%{opacity:.25}}
.m1{animation:d1 40s ease-in-out infinite alternate}
.m2{animation:d2 52s ease-in-out infinite alternate}
.m3{animation:d3 64s ease-in-out infinite alternate}
.spin{transform-origin:1380px 230px;animation:spin 90s linear infinite}
.pulse{animation:pulse 6s ease-in-out infinite}
.pulse2{animation:pulse 8s ease-in-out -3s infinite}
@media (max-aspect-ratio:1/1){.hl{transform:translateX(330px)}.hr{transform:translateX(-330px)}}
@media (max-aspect-ratio:3/5){.hl{transform:translateX(560px)}.hr{transform:translateX(-560px)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
<radialGradient id="ga"><stop offset="0" class="fa"/><stop offset="1" class="f0a"/></radialGradient>
<radialGradient id="gp"><stop offset="0" class="fp"/><stop offset="1" class="f0p"/></radialGradient>
<radialGradient id="gr"><stop offset="0" class="fr"/><stop offset="1" class="f0r"/></radialGradient>
</defs>
<rect class="bg" x="-200" y="-200" width="2000" height="1400"/>
<circle class="m1" cx="260" cy="200" r="560" fill="url(#ga)"/>
<circle class="m2" cx="1380" cy="820" r="600" fill="url(#gp)"/>
<circle class="m3" cx="1280" cy="140" r="400" fill="url(#gr)"/>
<g class="hl">
<path class="br" d="M70 150V80h80M70 850v70h80"/>
<line class="st" x1="150" y1="0" x2="150" y2="120" style="stroke-opacity:1;animation:rain 16s linear infinite"/>
<line class="st" x1="205" y1="0" x2="205" y2="70" style="stroke-opacity:.7;animation:rain 22s linear -9s infinite"/>
<line class="st" x1="260" y1="0" x2="260" y2="100" style="stroke-opacity:.85;animation:rain 19s linear -4s infinite"/>
<g class="bars"><rect x="100" y="760" width="150" height="6" rx="3"/><rect x="100" y="780" width="95" height="6" rx="3"/><rect class="pulse2" x="100" y="800" width="125" height="6" rx="3"/></g>
</g>
<g class="hr">
<path class="br" d="M1530 150V80h-80M1530 850v70h-80"/>
<line class="st p" x1="1340" y1="0" x2="1340" y2="90" style="stroke-opacity:.8;animation:rain 21s linear -13s infinite"/>
<line class="st" x1="1395" y1="0" x2="1395" y2="130" style="stroke-opacity:.95;animation:rain 17s linear -2s infinite"/>
<line class="st p" x1="1450" y1="0" x2="1450" y2="80" style="stroke-opacity:.7;animation:rain 24s linear -7s infinite"/>
<g class="spin"><circle class="ring" cx="1380" cy="230" r="105"/></g>
<circle class="ring2" cx="1380" cy="230" r="68"/>
<circle class="dot pulse" cx="1380" cy="230" r="7"/>
</g>
</svg>`

// 背景會被桌面版的毛玻璃面板蓋住、柔化，文字下方不會有清楚的線條干擾閱讀。
// 毛玻璃只蓋 45%，背景才透得出來；背景本身也要夠濃，不然會被模糊到看不見。
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE_NAME, glass: { blur: 18, opacity: 0.45 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    // 開發時用：桌面版若整套不畫，會跳出原因
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    // 剛啟動時桌面版常常還沒連上，這時 isDrawn 會是 false，
    // 但主題會保留，等桌面版連上就畫，所以不用在狀態列顯示原因。
    await $.theme.set(LOOK)

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.props.plugin !== $.plugin.name || e.props.scene !== SCENE_NAME) {
      return next(e)
    }
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)

    return (
      <Svg
        source={SCENE_SVG}
        alt="霧光慢慢飄動，兩側有細光落下，右上角光環緩緩轉動"
        isInteractive
      />
    )
  })
}
