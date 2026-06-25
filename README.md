# 台灣木工櫃體 3D 裁切計算工具-癮密工作室設計 v3.4

## 這版修正重點

### PWA 快取修正

你遇到的問題是：

```text
Ctrl + F5 會看到新版
普通 F5 又回到舊版標題
```

原因是 service worker 把舊版 `index.html` 快取住了。

v3.4 已將快取策略改成：

```text
index.html / app.js / style.css / manifest.json
優先抓網路新版
抓不到網路才使用快取
```

並且加入：

- `self.skipWaiting()`
- `self.clients.claim()`
- 自動刪除舊快取

## 上傳後第一次操作

上傳 v3.4 後，第一次請在瀏覽器做一次：

```text
Ctrl + F5
```

讓新的 service worker 接管。  
接著再按普通 F5，應該就不會回到舊標題。

## 更新 GitHub Pages

解壓縮 ZIP 後，把以下檔案全部覆蓋上傳到 repository 最外層：

- index.html
- style.css
- app.js
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png
- README.md

Commit changes 後等 1–5 分鐘。
