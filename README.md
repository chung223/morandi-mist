# 霧光 Morandi Mist

Claude 桌面版（Code 分頁）的主題。用莫蘭迪低彩度配色營造未來感，看久了眼睛也不累。淺色、深色兩版都有，背景是一條慢慢流動的光絲。

A calm, futuristic Morandi-palette theme for the Claude desktop app, with light and dark modes and a slow, silk-like animated backdrop.

## 長什麼樣子

- **淺色**：霧灰綠的底，深石板藍的字。強調色是霧湖藍。
- **深色**：夜霧藍灰的底，帶一點綠的米白字。深色是同一個「霧」的夜晚版，不是把淺色反過來。
- **狀態色**：紅、綠、黃還是錯誤、成功、警告的意思，只是都調成灰調。程式碼也用這幾個顏色上色。
- **動態背景「光絲流」**：兩束極細光絲交織。主束 22 條往左流，副束 12 條往右流、波長比較短、比較淡，左右兩端淡出。另外有稀疏的極細粒子分三層由左往右漂，近的快、遠的慢。顏色由上到下從湖藍、鼠尾草綠、沙色、乾燥玫瑰漸變到灰紫。
- **動一陣、停一陣**：所有東西一起緩緩流動 20 秒，再一起完全靜止 20 秒。靜止時畫面完全不用重畫，不耗資源。流動時同一束裡的幾組光絲走的距離略有不同，形狀會微微變化。無限循環，接縫對齊。
- 背景跟著系統的淺色、深色切換。
- 背景是不跑程式的 SVG 動畫，所以不會跟著滑鼠移動。動畫用 SVG 內建的 `<animateTransform>`，不會理會系統的「減少動態效果」設定。

## 安裝

在終端機的 Claude Code 輸入：

```
/plugin install morandi-mist --marketplace chung223/morandi-mist
```

或在 shell 裡執行：

```bash
claude plugin install morandi-mist --marketplace chung223/morandi-mist
```

在桌面版：按輸入框旁的 **+**，選 **Plugins**，用 **Add marketplace** 加入 `chung223/morandi-mist`，再按 **Add plugin**。

安裝時會先問要不要加入這個 marketplace，回答 `y`，範圍選使用者（user）。之後開的每個新對話都會套用。

## 注意

- 主題只在 Claude 桌面版和手機 App 上顯示，終端機裡的 Claude Code 不會變。
- 同一時間只會有一個主題生效。裝了別的主題外掛的話，最後套用的那個會蓋過前面的。
- 不想用了，就在外掛管理裡停用或移除 `morandi-mist`。

## 想自己改

配色和背景都寫在 [`hooks/register.tsx`](hooks/register.tsx)：

- 配色：`makeColors` 裡的 `light`、`dark` 兩組底色與文字色，以及 `ROLES` 裡的強調色和狀態色。
- 背景：`SCENE_SVG` 這張 SVG 是 [`tools/gen-silk.mjs`](tools/gen-silk.mjs) 產生的。改產生器開頭的參數（流動和靜止各幾秒、光絲條數、粗細、波浪幅度、粒子數量），執行 `node tools/gen-silk.mjs silk.svg`，再把 `silk.svg` 的內容整段貼回 `SCENE_SVG`。
- 效能：背景只要有東西在動，整個畫面就要重畫，負擔大約是「重畫次數 × 光絲條數」。光絲加太多會卡；用 CSS 動畫的話，就算靜止也會一直重畫，所以這裡用 SVG 內建的 `<animateTransform>`。
- 毛玻璃：`LOOK` 裡的 `glass`。`blur` 越大越模糊，`opacity` 越大背景越淡。光絲和粒子很細，`blur` 太大會看不見。

## 授權

MIT，見 [LICENSE](LICENSE)。

`hooks/make-colors.js` 和 `hooks/make-colors.d.ts` 是 Claude Code 外掛開發工具附的檔案，照原樣使用，不在 MIT 授權範圍內。
