# FRD-06 — Analytics & Reports

## 1. Overview
The analytics page `public/analytics.html` renders charts and KPIs using backend API data.

Unlike `dashboard.html`, this page uses `fetch()` calls to `http://localhost:3000/api/...`.

## 2. Entry Point
- `public/analytics.html`

## 3. Expected Backend API Contract (as implied)
The page calls:
- `GET /api/products`
- `GET /api/checkouts`

It expects both responses to be JSON with shape:
- `{ data: [...] }`

### Product object fields used by UI
- `quantity`
- `category`
- `min_stock` (optional; fallback uses `p.min_stock || 2`)
- `name`

### Checkout object fields used by UI
Only used to count totals (`checkouts.length`).

## 4. Functional Requirements
### 4.1 Load analytics data
On window load:
- `loadAnalysis()` runs.
- Uses `Promise.all` to fetch products and checkouts.

### 4.2 KPIs (stats)
It renders four statistics:
- Total Products = `products.length`
- Total Stock = sum of product quantities
- Total Checkouts = `checkouts.length`
- Low Stock Items = products where `0 < quantity <= (min_stock||2)`

### 4.3 Charts
- **Stock by Category** (bar)
  - categories from `Set(products.map(p => p.category))`
  - data = sum quantities per category
- **Stock Status Distribution** (doughnut)
  - “Well Stocked”: quantity > min_stock||2
  - “Low Stock”: 0 < quantity <= min_stock||2
  - “Out of Stock”: quantity === 0
- **Checkout Trends (Last 7 Days)** (line)
  - Implemented with mocked random counts per day.
- **Top Checked Out Products** (bar)
  - implemented as top products sorted by `quantity` (not by checkouts).

### 4.4 Chart lifecycle
- Charts are stored in `charts{}`.
- Before creating each chart, any existing chart with same canvas id is destroyed.

## 5. Non-Functional Requirements
- Analytics depends on backend availability.
- Trends and top checked-out products are currently not derived from real checkout history.

