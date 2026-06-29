# FRD-07 — Supplies & Restocking

## 1. Overview
`supplier/supplies.html` shows:
- a static supplier directory
- a “Recent Restock Orders” table populated from backend activity logs.

Implemented in `public/supplies.html`.

## 2. Functional Requirements
### 2.1 Supplier directory
- Render a fixed list of supplier cards.
- Cards include email, phone, location, and a category label.

### 2.2 Recent restock orders table
- On window load, `loadRestocks()` executes.
- It calls:
  - `GET /api/activity?type=PRODUCT_RESTOCKED&limit=20`
- Expects response shape:
  - `{ data: [...] }`
- Filters activities where `a.type === 'PRODUCT_RESTOCKED'`.
- For each restock activity, table row includes:
  - Product column: `r.details`
  - Supplier/Qty/Source columns: dashes (`—`)
  - Date: `new Date(r.timestamp||r.created_at).toLocaleDateString()`

### 2.3 Error handling
If fetch fails:
- log error to console.
- the table remains in its default “Loading...” state unless updated.

## 3. Backend Contract (implied)
Activity object fields used:
- `type`
- `details`
- `timestamp` or `created_at`

