# How the Software Works (Runtime/Data Flow)

## 1. High-level overview
This repository currently behaves as a **front-end heavy** application:
- `public/auth.html` performs demo authentication client-side.
- `public/dashboard.html` implements the main inventory system using **browser localStorage**.
- `public/inventory.html`, `public/analytics.html`, and `public/supplies.html` are separate UIs with inconsistent data sources:
  - `inventory.html`: localStorage-based CRUD (different schema)
  - `analytics.html`: backend API-based charts
  - `supplies.html`: backend API-based restock activity table

## 2. Session lifecycle
### 2.1 Login
- User enters email/password.
- Authentication delay (~1500ms) is applied.
- On success:
  - `localStorage.stockflow_auth='true'`
  - `localStorage.stockflow_user` stores `{email,name,loginTime}`
- Redirect to `dashboard.html`.

### 2.2 Logout
- `dashboard.html` logout clears `localStorage` and redirects to `auth.html`.

## 3. Dashboard (inventory system) lifecycle
### 3.1 Initialization
On `dashboard.html` load:
1. `loadData()` runs.
2. It loads three arrays from localStorage:
   - `inventory_products` -> `products`
   - `inventory_checkouts` -> `checkouts`
   - `inventory_activities` -> `activities`
3. If products are missing or too few, it seeds demo products.
4. It renders current view and badges.
5. It calculates low-stock banner.

### 3.2 In-memory state and persistence
All user actions mutate in-memory arrays first, then persist entire arrays back to localStorage.
- Product CRUD writes `inventory_products`.
- Checkout/return writes `inventory_checkouts` and updates `inventory_products`.
- Activity writes `inventory_activities`.

### 3.3 Low-stock alert propagation
Low-stock state is derived from product quantities and threshold (hard-coded to 5):
- `quantity === 0` => out of stock
- `0 < quantity <= 5` => low stock

Low-stock banner recalculates:
- during initialization
- every 30 seconds
- after product mutations (saveProducts)

### 3.4 Modal flows
- `productModal`: create/update product.
- `checkoutModal`: decrease quantity and create checkout record.
- `restockModal`: increase quantity and add restock activity.

## 4. Analytics & supplies lifecycle (API-based)
### 4.1 analytics.html
- Fetches from `http://localhost:3000/api/products` and `/api/checkouts`.
- Charts assume product objects include `quantity`, `category`, and `min_stock`.
- Checkout trends are mocked.

### 4.2 supplies.html
- Fetches restock activity from `/api/activity?type=PRODUCT_RESTOCKED&limit=20`.
- Table renders `details` and date from either `timestamp` or `created_at`.

## 5. Integration gaps / inconsistencies (current)
1. `dashboard.html` uses localStorage schema:
   - `inventory_products`, `inventory_checkouts`, `inventory_activities`
2. `analytics.html` and `supplies.html` expect backend-managed schema accessible via API endpoints.
3. `inventory.html` uses a different localStorage key `stockflow_products` with fields like `stock`, `price`, `minStock`.

**Result:** data changes in one UI likely do not appear in the others unless a backend synchronization layer is implemented.

