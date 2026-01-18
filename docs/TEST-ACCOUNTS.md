# 🔐 測試帳號

## 預設測試帳號（已在資料庫中）

資料來源：`db/sample-data.ts`

### 👤 管理員帳號
```
Email: admin@admin.com
Password: 123456
Role: admin
```

### 👤 一般使用者帳號
```
Email: user@user.com
Password: 123456
Role: user
```

---

## 快速測試

### 登入步驟：
1. 前往 http://localhost:3000/sign-in
2. 輸入上述任一組帳號密碼
3. 點擊 **Sign In**

### 或註冊新帳號：
1. 前往 http://localhost:3000/sign-up
2. 填寫你自己的資訊
3. 密碼至少 6 個字元

---

## 🛍️ 測試商品資料

已載入 7 個範例商品：

1. **Monti Sports Shoes** - $59.99 (庫存: 1)
2. **Carlo High Shoes for mens** - $85.90 (庫存: 10) ⭐ Featured
3. **Lama Party wear lady sandals** - $99.95 (庫存: 0) ❌ 缺貨
4. **Lama Sports Shoes** - $39.95 (庫存: 10) ⭐ Featured
5. **Nike Kids Shoes** - $79.99 (庫存: 6)
6. **Pata Office Shoes** - $99.99 (庫存: 8) ⭐ Featured
7. **Hilton Ladies Office Sandal** - $99.99 (庫存: 8)

所有商品都有：
- 尺寸選項：6, 7, 8, 9, 10
- 顏色選項：Black, White, Pink, Blue

---

## ⚠️ 注意事項

- **密碼都是 `123456`** - 僅用於測試，生產環境請使用強密碼
- 管理員和一般使用者帳號的差異（如果有實作管理後台的話）
- 缺貨商品（Lama Party wear）無法加入購物車，可用來測試庫存檢查

---

## 🔄 重置測試資料

如果需要重置資料庫：

```bash
npx tsx seed-local.ts
# 或
npx tsx ./db/seed
```

這會：
1. 清空所有使用者和商品
2. 重新載入範例資料
3. 恢復上述測試帳號
