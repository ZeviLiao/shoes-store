# 建議安裝的 Plugins 與工具

記錄建議加入專案的開發工具和 plugins。

---

## 📊 目前使用狀況

### ✅ 已安裝

- **React Hook Form** (`react-hook-form@7.54.2`) - 表單管理
  - 使用範圍：所有表單（註冊、登入、運送地址、付款方式）
  - 搭配 `@hookform/resolvers` + `zod` 進行驗證

- **ESLint** (`eslint@9`) - 程式碼檢查
  - 使用 Next.js 官方配置 (`next/core-web-vitals` + `next/typescript`)
  - Flat Config 格式 (`eslint.config.mjs`)

### ❌ 未安裝

- **Prettier** - 程式碼格式化工具
- **React Query / TanStack Query** - 客戶端狀態管理（目前用 Server Actions，暫不需要）
- **測試框架** - Jest / Vitest / Playwright
- **Git Hooks** - Husky + lint-staged

---

## 💡 建議安裝清單

### 🔴 Priority 1 - 強烈建議（立即安裝）

#### 1. Prettier - 程式碼格式化

**安裝指令**：
```bash
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D prettier-plugin-tailwindcss
```

**設定檔**：`.prettierrc`
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**忽略檔案**：`.prettierignore`
```
node_modules
.next
out
build
dist
*.min.js
package-lock.json
```

**好處**：
- ✅ 自動統一程式碼風格
- ✅ 自動排序 Tailwind CSS class names
- ✅ 減少 code review 時的格式爭議
- ✅ 支援多種檔案類型（JSON, Markdown, CSS）

**VSCode 設定**：`.vscode/settings.json`
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

**package.json scripts**：
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

#### 2. Husky + lint-staged - Git Hooks

**安裝指令**：
```bash
npm install -D husky lint-staged
npx husky init
```

**設定檔**：`package.json`
```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

**Husky hook**：`.husky/pre-commit`
```bash
npx lint-staged
```

**好處**：
- ✅ Commit 前自動 lint 和格式化
- ✅ 確保程式碼品質
- ✅ 防止不符合規範的程式碼進入 repo

---

### 🟡 Priority 2 - 建議考慮（1-2週內）

#### 3. Vitest - 測試框架

**安裝指令**：
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

**設定檔**：`vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**package.json scripts**：
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**好處**：
- ✅ 比 Jest 更快
- ✅ 原生 ESM 支援
- ✅ 測試 Server Actions
- ✅ 測試 React Components

**測試範例**：
```typescript
// test/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats number correctly', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });
});
```

---

#### 4. @next/bundle-analyzer - Bundle 分析

**安裝指令**：
```bash
npm install -D @next/bundle-analyzer
```

**設定**：`next.config.ts`
```typescript
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

**package.json scripts**：
```json
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

**好處**：
- ✅ 視覺化 bundle 大小
- ✅ 找出不必要的依賴
- ✅ 優化打包效能

---

### 🟢 Priority 3 - 選用增強（視需求）

#### 5. Playwright - E2E 測試

**安裝指令**：
```bash
npm install -D @playwright/test
npx playwright install
```

**設定檔**：`playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

**測試範例**：
```typescript
// e2e/checkout.spec.ts
import { test, expect } from '@playwright/test';

test('complete checkout flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Sign In');
  // ... 測試完整購物流程
});
```

**package.json scripts**：
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

#### 6. TanStack Query (React Query) - 客戶端狀態管理

**何時需要**：
- ❌ **目前不需要** - 專案已用 Server Actions
- ✅ **未來考慮** - 如果要加入：
  - 即時搜尋功能
  - 無限滾動
  - 樂觀更新 (optimistic updates)
  - 複雜的客戶端快取

**安裝指令**：
```bash
npm install @tanstack/react-query
npm install -D @tanstack/eslint-plugin-query
```

**設定範例**：
```typescript
// app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

#### 7. Storybook - 元件開發環境

**安裝指令**：
```bash
npx storybook@latest init
```

**好處**：
- ✅ 獨立開發 UI 元件
- ✅ 視覺化測試
- ✅ 元件文件化

**何時需要**：
- 元件庫較大時
- 需要設計系統文件
- 多人協作開發 UI

---

## 🎯 建議安裝順序

### 第一週

1. **Prettier** + **prettier-plugin-tailwindcss**
   - 建立統一的程式碼風格
   - 整理現有程式碼格式

2. **Husky** + **lint-staged**
   - 設定 Git hooks
   - 確保新程式碼符合規範

### 第二週

3. **Vitest**
   - 建立測試環境
   - 開始寫單元測試
   - 測試 utility functions 和 Server Actions

4. **@next/bundle-analyzer**
   - 分析打包大小
   - 優化效能

### 未來視需求

5. **Playwright** - 如果需要 E2E 測試
6. **TanStack Query** - 如果需要複雜客戶端狀態
7. **Storybook** - 如果元件庫變大

---

## 📝 不建議安裝

### ❌ Redux / Zustand / Jotai
**原因**：
- 專案使用 Server Actions 和 Server Components
- 不需要複雜的全域狀態管理
- React 19 + Next.js 15 已經處理大部分狀態需求

### ❌ Axios
**原因**：
- 使用 Server Actions，不需要 HTTP client
- Next.js fetch 已經足夠

### ❌ Lodash
**原因**：
- 現代 JavaScript 已有大部分功能
- 增加 bundle 大小
- 可以用原生方法替代

---

## 🔧 快速安裝指令

### 必要工具（立即安裝）

```bash
# Prettier 相關
npm install -D prettier eslint-config-prettier eslint-plugin-prettier prettier-plugin-tailwindcss

# Git hooks
npm install -D husky lint-staged
npx husky init
```

### 測試工具（建議安裝）

```bash
# Vitest
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom

# Bundle Analyzer
npm install -D @next/bundle-analyzer
```

### E2E 測試（選用）

```bash
# Playwright
npm install -D @playwright/test
npx playwright install
```

---

## 📚 相關文件

- [Prettier 官方文件](https://prettier.io/docs/en/)
- [Husky 官方文件](https://typicode.github.io/husky/)
- [Vitest 官方文件](https://vitest.dev/)
- [Playwright 官方文件](https://playwright.dev/)
- [TanStack Query 官方文件](https://tanstack.com/query/latest)

---

**最後更新**：2026-01-18
