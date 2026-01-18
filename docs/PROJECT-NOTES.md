# 專案筆記與發現

本文件記錄專案設定過程中的重要發現和注意事項。

---

## 📅 設定時間軸

### 2026-01-18 初次設定

1. **資料庫連接**
   - 從 Docker PostgreSQL 容器取得密碼
   - 設定 `.env` 檔案
   - 執行資料庫遷移和種子資料

2. **主題設定**
   - 修改預設主題從 `system` 改為 `light`
   - 停用系統主題跟隨功能

3. **Prisma 設定調整**
   - 修改 `db/prisma.ts` 支援本地 PostgreSQL
   - 原本只支援 Neon 雲端資料庫

---

## 🔍 重要發現

### 1. Admin vs User 角色

**結論：目前沒有實際差異**

- ✅ 資料庫有 `role` 欄位（admin / user）
- ✅ Session 中有儲存 role
- ❌ **沒有管理後台**
- ❌ **沒有權限控制邏輯**
- ❌ **沒有任何功能區分 admin 和 user**

**推測**：
- 這是教學範例專案
- role 欄位是預留給未來擴充的
- 目前所有使用者功能完全相同

**缺少的管理功能**：
- 商品管理（CRUD）
- 使用者管理
- 訂單管理（查看所有訂單、更新狀態）
- 統計報表

---

### 2. 圖片託管

**來源：UploadThing**

所有商品圖片都存在 `https://utfs.io/` 上：

```
https://utfs.io/f/HI9tOglpZNuRyB1OGYWXfM69BcwTqWAlC7gsmju2nhIRbp0Y
```

**UploadThing 是什麼？**
- 檔案託管服務（類似 AWS S3）
- 專為開發者設計
- 託管在 Cloudflare CDN
- 官網：https://uploadthing.com

**注意事項**：
- 這些圖片是原教學作者上傳的
- 存在原作者的 UploadThing 帳號
- 可以使用但無法修改/刪除
- 如需使用自己的圖片：
  1. 註冊 UploadThing 帳號
  2. 上傳圖片
  3. 替換 `db/sample-data.ts` 中的 URL

**Next.js 圖片設定**：
```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "utfs.io" },           // UploadThing 商品圖
    { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google 頭像
    { protocol: "https", hostname: "platform-lookaside.fbsbx.com" }, // Facebook 頭像
  ],
}
```

---

### 3. 種子資料 (Seed Data)

**執行時機**：在設定資料庫連接後自動執行

**執行內容**：
```bash
npx prisma db push --accept-data-loss  # 建立資料表
npx tsx seed-local.ts                  # 載入範例資料
```

**載入的資料**：
- 👥 **2 個使用者**
  - Kumar Admin (admin@admin.com) - role: admin
  - Kumar User (user@user.com) - role: user
  - 密碼都是：`123456`

- 🛍️ **7 個商品**
  1. Monti Sports Shoes - $59.99 (庫存: 1)
  2. Carlo High Shoes for mens - $85.90 (庫存: 10) ⭐ Featured
  3. Lama Party wear lady sandals - $99.95 (庫存: 0) ❌ 缺貨
  4. Lama Sports Shoes - $39.95 (庫存: 10) ⭐ Featured
  5. Nike Kids Shoes - $79.99 (庫存: 6)
  6. Pata Office Shoes - $99.99 (庫存: 8) ⭐ Featured
  7. Hilton Ladies Office Sandal - $99.99 (庫存: 8)

**商品屬性**：
- 所有商品都有尺寸選項：6, 7, 8, 9, 10
- 所有商品都有顏色選項：Black, White, Pink, Blue

---

## 🛠️ 技術架構調整

### Prisma 資料庫連接

**原始設定**：只支援 Neon 雲端資料庫

**修改後**：自動偵測並支援兩種模式

```typescript
// db/prisma.ts
const isNeonDB = process.env.DATABASE_URL?.includes('neon.tech');

if (isNeonDB) {
  // 使用 Neon adapter (WebSocket 連接)
} else {
  // 使用標準 Prisma Client (本地 PostgreSQL)
}
```

**好處**：
- ✅ 可以在本地開發使用 Docker PostgreSQL
- ✅ 部署時可以切換到 Neon 雲端資料庫
- ✅ 不需要修改程式碼

---

### 主題設定

**原始設定**：
```typescript
defaultTheme="system"  // 跟隨系統
enableSystem           // 啟用系統偵測
```

**修改後**：
```typescript
defaultTheme="light"     // 預設淺色
enableSystem={false}     // 停用系統偵測
```

**效果**：
- 預設使用淺色主題
- 不會根據作業系統設定自動切換
- 使用者仍可手動切換深色模式
- 選擇會儲存在 localStorage

---

## 📊 目前資料庫狀態

截至設定完成時：

```
📊 資料庫狀態：
👥 使用者：2 筆
🛍️ 商品：7 筆
📦 訂單：2 筆 (測試時產生)
```

**查詢資料庫狀態**：
```bash
npx prisma studio  # 開啟圖形化介面
```

**重置資料庫**：
```bash
npx tsx ./db/seed  # 重新載入種子資料
```

---

## 🚫 缺少的功能

### 後台管理
- ❌ 沒有 `/admin` 路由
- ❌ 沒有管理介面
- ❌ admin 角色沒有特殊權限

### 電商功能
- ❌ 商品搜尋/篩選
- ❌ 評價系統（雖然有 rating 和 numReviews 欄位）
- ❌ 訂單追蹤/物流狀態
- ❌ 退貨/退款流程
- ❌ Email 通知
- ❌ 優惠券/折扣碼

### 使用者功能
- ❌ 忘記密碼
- ❌ Email 驗證
- ❌ 個人資料編輯頁面（完整版）
- ❌ 訂單歷史查詢

---

## ✅ 已實作功能

### 核心功能
- ✅ 使用者註冊/登入（Credentials）
- ✅ OAuth 登入（Google, Facebook）- 需設定 tokens
- ✅ 商品展示
- ✅ 商品詳情頁
- ✅ 購物車（新增、更新、刪除）
- ✅ 結帳流程（運送地址 → 付款方式 → 確認訂單）
- ✅ 訂單建立
- ✅ PayPal 付款整合（需設定 credentials）
- ✅ 貨到付款選項
- ✅ Session 管理（JWT）
- ✅ 深色/淺色主題切換

### 技術特色
- ✅ Next.js 15 App Router
- ✅ React 19
- ✅ TypeScript
- ✅ Prisma ORM
- ✅ NextAuth v5 (beta)
- ✅ Tailwind CSS 4
- ✅ shadcn/ui 元件
- ✅ Zod 表單驗證
- ✅ Server Actions

---

## 🔐 安全設定

### 已保護的檔案
```
.gitignore 中包含：
- .env                              # 環境變數
- docs/database-password-recovery.md # 敏感文件
```

### 環境變數
已設定的必要變數：
- ✅ `DATABASE_URL` - PostgreSQL 連接字串
- ✅ `NEXTAUTH_SECRET` - JWT 加密金鑰

選用變數（未設定）：
- ❌ `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- ❌ `AUTH_FACEBOOK_ID` / `AUTH_FACEBOOK_SECRET`
- ❌ `PAYPAL_CLIENT_ID` / `PAYPAL_APP_SECRET`

---

## 📝 專案定位

**結論：這是一個教學範例專案**

**證據**：
1. Git commit 訊息有 "Session 32", "Session 33" 等字樣
2. 只實作核心電商流程
3. 缺少管理後台和進階功能
4. 使用教學作者的 UploadThing 圖片
5. 簡單的測試帳號密碼（123456）

**適合用於**：
- 學習 Next.js 15 + App Router
- 了解電商網站基本架構
- 學習 NextAuth v5 實作
- 練習 Prisma ORM
- 作為起始模板擴充功能

**不適合用於**：
- 直接上線的生產環境
- 需要完整管理功能的專案
- 企業級電商平台

---

## 🎯 後續可擴充的方向

### 短期改進
1. 新增管理後台基本功能
2. 實作商品搜尋/篩選
3. 完善訂單管理
4. 新增使用者個人頁面

### 中期擴充
1. Email 通知系統
2. 評價/評論功能
3. 訂單追蹤
4. 優惠券系統

### 長期規劃
1. 多語系支援
2. 多幣別支援
3. 庫存管理系統
4. 數據分析儀表板

---

## 📚 相關文件

- [CLAUDE.md](../CLAUDE.md) - Claude Code 使用指南
- [TESTING.md](TESTING.md) - 測試指南
- [TEST-ACCOUNTS.md](TEST-ACCOUNTS.md) - 測試帳號
- [database-password-recovery.md](database-password-recovery.md) - 資料庫密碼查詢方法（不會推送）

---

**最後更新**：2026-01-18
