# Leave Web

Vue 3 與 Vite 建立的請假系統前端。使用者可先以練習帳密登入，再進入請假列表執行新增、查詢、狀態更新與刪除。

## 技術規格

- Vue 3、TypeScript、Vite
- Composition API、`<script setup lang="ts">`
- Vue Router、Pinia
- Axios（共用 `baseURL`、timeout 與錯誤回應攔截器）
- Vitest、Cypress
- ESLint、Oxlint、Prettier

## 環境需求

- Node.js `^22.18.0` 或 `>=24.12.0`
- Leave API 執行於 `http://localhost:8080`

## 安裝與啟動

先啟動 `leave-api`，再於本目錄執行：

```bash
npm install
npm run dev
```

Vite 預設網址為 `http://localhost:5173`。

## 使用者流程

1. 進入 `/`，使用 `admin`／`1234` 呼叫 `POST /api/auth/login`。
2. 登入成功後由 Vue Router 導向 `/leave`，並呼叫 `GET /api/leaves`。
3. 新增表單呼叫 `POST /api/leaves`，新資料狀態由後端預設為 `PENDING`。
4. 選擇狀態時呼叫 `PUT /api/leaves/{id}/status`；按刪除則呼叫 `DELETE /api/leaves/{id}`。
5. 狀態篩選使用 `GET /api/leaves?status=...`，重新整理與 CRUD 後都保留目前篩選條件。
6. 畫面提供 loading、空資料與錯誤狀態。

後端回應格式必須是：

```json
{
  "data": [],
  "code": null,
  "message": null
}
```

JSON 欄位區分大小寫。若 `code` 不為 `null` 或 HTTP 回應失敗，畫面會顯示錯誤訊息。

## 前端結構

```text
src/
├── api/authApi.ts
├── api/leaveApi.ts
├── assets/main.css
├── components/LeaveTable.vue
├── composables/useLeaves.ts
├── router/index.ts
├── services/http.ts
├── types/auth.ts
├── types/leave.ts
├── views/LoginForm.vue
├── views/LeaveListView.vue
├── views/__tests__/LeaveListView.spec.ts
├── App.vue
└── main.ts
```

資料流：

```text
RouterView → LoginForm → authApi ───────────────┐
                                               ├→ http → /api/**
           LeaveListView → useLeaves → leaveApi ┘
                         └→ LeaveTable → 顯示與操作請假資料
```

- `types`：API 型別、狀態集合及中文標籤的單一來源。
- `services/http.ts`：只設定 Axios 的 `baseURL`、timeout 與統一錯誤處理。
- `api`：唯一呼叫 `http` 的位置，涵蓋登入及請假 CRUD。
- `composables`：管理 loading、錯誤、資料與查詢流程。
- `components`：透過 props 與 events 呈現可重用 UI。
- `views`：組合 composable 與 components，作為 Router 頁面。
- `App.vue`：提供根層 `RouterView`。

## 驗證

```bash
npm run test:unit -- --run
npm run build
npx eslint .
npx oxlint .
npx prettier --check src cypress README.md SKILL.md
```

瀏覽器端 E2E：

```bash
npm run test:e2e
```

如果 Cypress 本機程式在啟動 smoke test 時出現 `SIGABRT`，這是執行環境問題；仍需在可啟動 Cypress 的環境補跑 E2E，不能用 build 或 unit test 取代該結果。
