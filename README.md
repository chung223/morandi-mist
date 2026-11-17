# 霧光 Morandi Mist

Claude 桌面版（Code 分頁）的配色主題。用莫蘭迪低彩度配色營造安靜的未來感，看久了眼睛也不累。淺色、深色兩版都有。

A calm, futuristic Morandi-palette color theme for the Claude desktop app, with light and dark modes.

## 長什麼樣子

- **淺色**：霧灰綠的底，深石板藍的字。強調色是霧湖藍。
- **深色**：夜霧藍灰的底，帶一點綠的米白字。深色是同一個「霧」的夜晚版，不是把淺色反過來。
- **狀態色**：紅、綠、黃還是錯誤、成功、警告的意思，只是都調成灰調。程式碼也用這幾個顏色上色。
- 只換配色，沒有動態背景，不會額外耗電。

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

配色寫在 [`hooks/register.tsx`](hooks/register.tsx)：`makeColors` 裡的 `light`、`dark` 兩組底色與文字色，以及 `ROLES` 裡的強調色和狀態色。

### 關於動態背景

之前的版本有會動的背景（光絲、粒子），在桌面版遇到這些問題，所以拿掉了，舊版留在 git 紀錄裡：

- 背景只要有東西在動，整個畫面就要重畫。細線一多，畫面就會一陣一陣卡住。
- 用 CSS 寫的動畫就算靜止也會一直重畫；改用 SVG 內建的 `<animateTransform>`，播完就停的寫法在桌面版又會停住不再動。
- 改成一直播放的寫法後，畫面會整片閃爍。

## 授權

MIT，見 [LICENSE](LICENSE)。

`hooks/make-colors.js` 和 `hooks/make-colors.d.ts` 是 Claude Code 外掛開發工具附的檔案，照原樣使用，不在 MIT 授權範圍內。
