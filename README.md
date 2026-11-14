# 霧光 Morandi Mist

Claude 桌面版（Code 分頁）的主題。用莫蘭迪低彩度配色營造未來感，看久了眼睛也不累。淺色、深色兩版都有，還有一張會慢慢動的背景。

A calm, futuristic Morandi-palette theme for the Claude desktop app, with light and dark modes and a slow animated backdrop.

## 長什麼樣子

- **淺色**：霧灰綠的底，深石板藍的字。強調色是霧湖藍。
- **深色**：夜霧藍灰的底，帶一點綠的米白字。深色是同一個「霧」的夜晚版，不是把淺色反過來。
- **狀態色**：紅、綠、黃還是錯誤、成功、警告的意思，只是都調成灰調。程式碼也用這幾個顏色上色。
- **動態背景**：左上一團湖藍霧光、右下一團灰紫霧光，40～64 秒慢慢飄一趟。四個角有細框線，左右兩側有細光往下落，右上角有光環慢慢轉。中間和下方留給對話與輸入框。
- 背景跟著系統的淺色、深色切換。系統開了「減少動態效果」的話，背景會停住不動。

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
- 背景：`SCENE_SVG` 是一張 SVG，動畫用 CSS 寫在裡面的 `<style>`。
- 毛玻璃：`LOOK` 裡的 `glass`。`opacity` 越大，背景越淡。

## 授權

MIT，見 [LICENSE](LICENSE)。

`hooks/make-colors.js` 和 `hooks/make-colors.d.ts` 是 Claude Code 外掛開發工具附的檔案，照原樣使用，不在 MIT 授權範圍內。
