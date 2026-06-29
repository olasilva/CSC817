# FRD-05 — Low Stock Alerts

## 1. Overview
The system calculates low/out-of-stock products and shows:
- a persistent notification banner in the top-right of the dashboard
- toast notifications
- updates a sidebar badge for “Low Stock”

Implemented in `public/dashboard.html`.

## 2. Threshold Rules
- **Low stock**: `quantity > 0 && quantity <= 5`
- **Out of stock**: `quantity === 0`

> Note: `min_stock` exists on product objects, but low stock alerts are hard-coded to threshold `5` in this dashboard implementation.

## 3. Functional Requirements
### 3.1 Banner trigger
`checkLowStockAlert()`:
- computes `lowItems` and `outItems`
- if any exist:
  - shows banner (`notifBanner` add class `show`)
  - sets `notifTitle` to `⚠️ Low Stock Alert (${lowItems.length + outItems.length} items)`
  - sets banner message:
    - includes count and per-category item list for low items
    - includes out-of-stock count and a truncated list of first 3 names
- if none exist:
  - removes `show` class.

### 3.2 Toast notifications
When there is low stock:
- toast warning for up to 3 low items, with additional “+N more” suffix.
When there is out-of-stock:
- toast error for out-of-stock count.

### 3.3 Update badges
After alert calculation, it updates sidebar badge:
- `lsBadge = products.filter(p => p.quantity > 0 && p.quantity <= 5).length`

### 3.4 Periodic refresh
- A timer runs `checkLowStockAlert()` every 30 seconds.
- Also recalculated after any `saveProducts()` (product create/update, checkout decrement, restock increment, return increment).

## 4. Non-Functional Requirements
- Potential toast duplication risk exists because the function runs periodically; there is no de-duplication suppression.

