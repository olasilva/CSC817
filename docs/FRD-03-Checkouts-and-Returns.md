# FRD-03 — Checkouts & Returns

## 1. Overview
Users can check out an item, decrementing its quantity and recording a checkout record. Items can be returned, incrementing quantity and removing the checkout record.

Implemented in `public/dashboard.html`.

## 2. Entities
### 2.1 Checkout record
Stored in `localStorage.inventory_checkouts` and loaded into `checkouts`.

Fields created during checkout:
- `id`: `CO-${Date.now()}`
- `productId`: product `id`
- `productName`: snapshot of product name
- `productSku`: snapshot of product sku
- `category`
- `location`: required
- `refNumber`: required
- `assignedTo`: optional
- `department`: optional
- `notes`: optional
- `checkedOutAt`: ISO timestamp

### 2.2 Activity log
Stored in `localStorage.inventory_activities` and maintained as an array `activities`.

Activity entries added:
- `Checkout`: details string `${productName} (${sku}) checked out to ${location}`
- `Return`: details string `${productName} returned from ${location}`

## 3. Functional Requirements
### 3.1 Start checkout
User clicks a product card; `startCheckout(pid)` is called.
Requirements:
- Find product by id.
- If product quantity <= 0:
  - show toast `Out of stock` with type `error`.
  - do not open modal.
- Otherwise:
  - populate checkout modal summary with product info
  - set hidden input `coProdId`
  - open `checkoutModal`.

### 3.2 Confirm checkout
On submit (`checkoutForm` -> `doCheckout`):
- Build checkout record from modal inputs.
- Validate required fields:
  - `location` must be non-empty
  - `refNumber` must be non-empty
- If validation fails:
  - toast `Fill required fields`.

Inventory mutation:
- Decrement product quantity by 1 (not below 0).

Persistence:
- Append checkout record to `checkouts`.
- Save:
  - `saveCheckouts()` writes `inventory_checkouts`
  - `saveProducts()` writes `inventory_products` and triggers low stock recalculation.
  - `addActivity()` writes activities to `inventory_activities`.

UI updates:
- toast `Checked out successfully`
- close modal
- call `loadData()` to rerender views and badges.

### 3.3 Return checkout
User clicks Return button in checkouts table; `doReturn(cid)` is called.
Requirements:
- Confirm dialog: `Return this item to inventory?`.
- Find checkout record by `cid`.
- Find associated product and increment its quantity by 1.
- Remove checkout record from `checkouts`.
- Persist:
  - `saveProducts()` and `saveCheckouts()`
  - `addActivity('Return', ... )`

UI updates:
- toast `Item returned`
- rerender by calling `loadData()`.

## 4. Export
### 4.1 CSV export of checkouts
- `exportCSV()` builds a CSV using `checkouts` entries.
- Download filename: `checkouts.csv`.

If no checkouts:
- toast `Nothing to export`.

## 5. Non-Functional Requirements
- Checkout/return operations are single-browser and do not sync across devices.
- No audit immutability; activities are stored as mutable client state.

