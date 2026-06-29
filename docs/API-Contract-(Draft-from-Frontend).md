# API Contract (Draft inferred from frontend)

> This document is inferred from `public/analytics.html` and `public/supplies.html`.
> The server implementation is not present in the visible files in this repo snapshot.

## 1. Base URL
Both pages use:
- `const API = 'http://localhost:3000/api'`

So the implied base is:
- `GET http://localhost:3000/api/*`

## 2. Endpoints

### 2.1 GET `/api/products`
Used by `analytics.html`.

Expected response:
```json
{
  "data": [ /* product objects */ ]
}
```

Product fields used:
- `quantity` (number)
- `category` (string)
- `min_stock` (number; optional)
- `name` (string)

### 2.2 GET `/api/checkouts`
Used by `analytics.html`.

Expected response:
```json
{
  "data": [ /* checkout objects */ ]
}
```

Only `length` is used by the page.

### 2.3 GET `/api/activity?type=PRODUCT_RESTOCKED&limit=20`
Used by `supplies.html`.

Expected response:
```json
{
  "data": [ /* activity objects */ ]
}
```

Activity fields used:
- `type` (string)
- `details` (string) shown as product column
- `timestamp` OR `created_at` (date)

## 3. Notes / Draft status
- These are inferred from UI usage.
- Current `dashboard.html` does **not** call these endpoints; it uses localStorage.
- To unify the app, a backend persistence layer should be implemented with consistent schemas.

