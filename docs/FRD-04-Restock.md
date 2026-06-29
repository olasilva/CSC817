# FRD-04 — Restock

## 1. Overview
Restock allows adding quantity back into inventory for a selected product, and logs an activity.

Implemented in `public/dashboard.html`.

## 2. Entry Points
- Category panel: `openRestockForm()`
- Dashboard category drill-down: Restock button triggers restock modal.

## 3. Entities
Restock does not create a separate “restock order” entity. It mutates the product quantity and logs an activity entry.

Activity entry added:
- type: `Restock`
- details: `${product.name} restocked +${qty} units from ${rsSource || 'supplier'}`

## 4. Functional Requirements
### 4.1 Open restock form
`openRestockForm()`:
- populates product dropdown `rsProd` with products filtered by current category (if `currentCategory` exists)
- resets the `restockForm`
- hides preview `rsPreview`
- opens `restockModal`.

### 4.2 Live preview
`previewRestock()`:
- finds selected product
- shows preview with product name and SKU and current quantity.

### 4.3 Submit restock
On submit (`restockForm` -> `doRestock`):
- Parse inputs:
  - product id from `rsProd`
  - qty from `rsQty` (integer)
  - source from `rsSource` (optional)
- Validation:
  - product must be selected
  - `qty >= 1`
- On validation failure:
  - toast `Select product and quantity` with type `error`.

Inventory mutation:
- locate product by id
- increase `quantity += qty`

Persistence / side effects:
- `saveProducts()` writes updated products to `inventory_products`
- `addActivity('Restock', ...)` writes to `inventory_activities`
- `checkLowStockAlert()` runs (via `saveProducts()`)

UI updates:
- toast `Restocked ${qty} units`
- close modal
- call `loadData()`.

## 5. Non-Functional Requirements
- Restock behavior is client-local.
- Activity log length is capped at 100 entries (because `addActivity` truncates after unshift).

