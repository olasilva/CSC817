# FRD-02 — Inventory Management (Dashboard localStorage CRUD)

## 1. Overview
Inventory items are managed in `public/dashboard.html` using in-memory arrays persisted to browser `localStorage`.

> Note: This FRD describes the behavior implemented in `dashboard.html` (not the separate `inventory.html` page).

## 2. Entry Points
- `public/dashboard.html`

## 3. Entities & Data Model
### 3.1 Product
A product record is stored in `localStorage.inventory_products` and loaded into the in-memory array `products`.

Fields used by the UI:
- `id` (string) — product identifier
- `name` (string)
- `sku` (string) — stock keeping unit
- `category` (string)
- `quantity` (number) — current stock quantity
- `location` (string)
- `image_url` (string)
- `description` (string)
- `min_stock` (number) — currently set to 5 in create/update flows
- `created_at` (ISO-8601 string)

### Storage schema (inferred)
```json
{
  "id": "SKU-0001",
  "name": "string",
  "sku": "string",
  "category": "string",
  "quantity": 0,
  "location": "string",
  "image_url": "string",
  "description": "string",
  "min_stock": 5,
  "created_at": "ISO-8601 string"
}
```

## 4. Functional Requirements
### 4.1 Initial load / seeding
On page load:
- Load `inventory_products`.
- If missing or fewer than 40 items:
  - generate demo products via `generateDefaultProducts()`
  - persist them into `inventory_products`.

### 4.2 Product listing views
The dashboard supports view switching:
- `dashboardPanel` (stats + category tiles + recent activity)
- `inventoryPanel` (all products grid with category filter)
- `categoryPanel` (category drill-down + restock/add actions)

### 4.3 Inventory filter (All inventory view)
On `inventoryPanel`:
- Category filter `invFilter` controls displayed products.
- `renderInventory()` updates the category options and the product grid.

### 4.4 Search
- `globalSearch` input filters within the client-side `products` list.
- If query length > 0:
  - navigate to inventory view
  - show matching products (name or sku includes query)
  - show empty state when none found.
- If query clears and current view is inventory:
  - rerender inventory.

### 4.5 Create / Update Product modal
A modal (`productModal`) is used for both create and edit.

Modal open behavior:
- `openProductForm(editId)`
  - populates category dropdown from `CATS`
  - if `editId` provided, pre-fills form with existing product
  - else sets SKU default: `SKU-${products.length + 1 (zero padded)}`

Save behavior (submit `productForm`):
- Collect required fields: `name`, `category`, `sku`.
- `quantity` parsed as integer; defaults to 0 if parse fails.
- `min_stock` always saved as `5`.
- `created_at` always set to `new Date().toISOString()` in this implementation.

Validation:
- If `name`, `category`, or `sku` missing/empty: show toast `Fill required fields`.

Persist rules:
- If editing:
  - locate product by `id`, merge and replace fields.
  - add activity entry type `Update`.
- If creating:
  - push new record into `products`.
  - add activity entry type `Create`.

After save:
- `saveProducts()` updates `inventory_products`.
- Modal is closed.
- Dashboard reloads (`loadData()`).

## 5. Persistence & Side Effects
### 5.1 localStorage write
- `saveProducts()` writes the entire `products` array to `inventory_products`.

### 5.2 Badge updates + low stock recalculation
- After saving products, UI updates:
  - badge counts (total products, checked outs, low-stock count)
  - low stock banner via `checkLowStockAlert()`.

## 6. Non-Functional Requirements
- Works fully offline; state is client-local.
- No concurrency control (last write wins per browser).

