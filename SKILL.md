---
name: leave-web
description: Maintain the leave-web Vue frontend while preserving its Axios API contract, login routing, leave CRUD, tests, and documentation.
---

# Leave Web 前端維護

保留 Vue 3、TypeScript、Vite、Composition API、`<script setup lang="ts">`、Vue Router、Pinia、Axios、Vitest、Cypress、ESLint、Oxlint 與 Prettier。

## 分層責任

依 `types → api → composables → components/views` 的方向維持單向依賴：

- `types` 與後端 JSON 一致；`data`、`code`、`message` 區分大小寫。
- `leaveStatuses` 與 `statusLabels` 是前端狀態選項及中文顯示的單一來源，不在 View 或 Component 重複 mapping。
- `services/http.ts` 只負責 Axios 的 `baseURL`、timeout 與回應錯誤攔截器，不加入 Router 或畫面狀態。
- `api` 是唯一呼叫 `http` 的位置，不在 View 或 Component 重複網址與 HTTP 細節。
- `composables` 管理非同步狀態與行為，至少讓 loading、錯誤與成功都能結束。
- `components` 只透過 props 與 events 呈現可重複 UI。
- `views` 組合 composables 與 components，並由 Router 對應頁面。
- `App.vue` 只承擔應用程式根層責任。

## 行為規則

- 登入頁呼叫 `POST /api/auth/login`；成功後只能透過 Vue Router 導向具名路由 `leave-list`。
- 首次載入取得全部請假資料。
- 建立、狀態更新及刪除都由 `useLeaves` 呼叫 `leaveApi`，成功後依目前篩選條件重新取得清單。
- 狀態篩選只傳後端接受的 `PENDING`、`APPROVED`、`REJECTED`。
- 重新整理必須沿用目前的篩選條件，畫面選項不可與請求 URL 不一致。
- loading、空資料、API 錯誤都必須能進入明確且可結束的畫面狀態。
- 使用者看到中文狀態，API 仍使用固定英文代碼。
- API 單元測試 mock `leaveApi` 或 Axios 邊界，不再 mock 已停用的原生 `fetch`。

## 驗證

變更後依序執行：

```bash
npm run test:unit -- --run
npm run build
npx eslint .
npx oxlint .
npx prettier --check src cypress README.md SKILL.md
```

修改使用者流程時再執行 `npm run test:e2e`。若 Cypress 執行檔因環境 `SIGABRT` 無法啟動，精確記錄為未完成的瀏覽器驗證，不可宣稱 E2E 通過。

README 必須反映目前的目錄、資料流、API 契約、使用者行為與實際驗證指令。
