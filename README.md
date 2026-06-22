# 台灣木工櫃體 3D 裁切計算工具 MVP v2.2

## 這版修正重點

### 手機不用再放大縮小

v2.1 手機版仍有桌機表格撐寬頁面的問題，導致手機瀏覽器會把整頁縮小，文字看起來太小。

v2.2 已修正：

- 手機版裁切清單改成卡片式
- 不再使用桌機橫向表格
- 手機版字體加大
- 輸入欄位更好點選
- 防止頁面被表格撐寬
- 板材排版圖不會撐出螢幕外
- 手機不需要反覆放大縮小

## 電腦版不變

這版只針對手機寬度調整，電腦版三欄工具版面維持原本樣子。

## 更新 GitHub Pages

解壓縮後，把這些檔案全部上傳覆蓋 GitHub repository 最外層：

- index.html
- style.css
- app.js
- manifest.json
- service-worker.js
- icon-192.png
- icon-512.png
- README.md

Commit changes 後等 1–5 分鐘。

## 手機還看到舊版時

因為 PWA 有快取，建議：

1. 重新整理網頁
2. 關閉瀏覽器再開
3. 刪掉主畫面 App 後重新加入
4. 等 GitHub Pages 部署完成
