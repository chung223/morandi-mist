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

// 只換配色，不放動態背景：背景就是 App 自己畫的平面底色，跟著淺色、深色切換。
// 以前試過會動的背景（光絲、粒子、霧光），在桌面版會閃爍、卡住或停住，還會多耗電，所以拿掉了（見 git 紀錄）。
const LOOK: ThemeSetArgs = { colors: theme }

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
}
