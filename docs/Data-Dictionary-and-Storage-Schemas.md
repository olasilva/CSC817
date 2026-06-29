# Data Dictionary & Storage Schemas

## 1. Client-side localStorage keys
### 1.1 Authentication
- `stockflow_auth` (string)
  - `'true'` indicates session is active.

- `stockflow_user` (JSON string)
  - schema:
    - `email` (string)
    - `name` (string)
    - `loginTime` (ISO-8601 string)

### 1.2 Dashboard inventory storage
#### Products
- Key: `inventory_products`
- Type: JSON array of product objects.

Product fields (used by dashboard UI):
- `id`: string
- `name`: string
- `sku`: string
- `category`: string
- `quantity`: number
- `location`: string
- `image_url`: string
- `description`: string
- `min_stock`: number (dashboard sets to `5`)
- `created_at`: ISO timestamp

#### Checkouts
- Key: `inventory_checkouts`
- Type: JSON array of checkout objects.

Checkout fields:
- `id`: string (e.g., `CO-${Date.now()}`)
- `productId`: string
- `productName`: string
- `productSku`: string
- `category`: string
- `location`: string (required)
- `refNumber`: string (required)
- `assignedTo`: string (optional)
- `department`: string (optional)
- `notes`: string (optional)
- `checkedOutAt`: ISO timestamp

#### Activity log
- Key: `inventory_activities`
- Type: JSON array of activity entries.

Activity fields:
- `type`: string (`Checkout`, `Return`, `Restock`, `Create`, `Update`)
- `details`: string
- `timestamp`: ISO timestamp

### 1.3 Inventory page storage (separate implementation)
- Key: `stockflow_products`
- Type: JSON array.

Fields used by `public/inventory.html`:
- `id`: string
- `name`: string
- `category`: string
- `stock`: number
- `price`: number
- `minStock`: number
- `createdAt`: ISO timestamp

## 2. Backend storage (not present in repo)
`public/analytics.html` and `public/supplies.html` assume backend endpoints returning:
- `/api/products` -> product objects with fields: `quantity`, `category`, `min_stock`, `name`
- `/api/checkouts` -> checkout list
- `/api/activity?type=PRODUCT_RESTOCKED&limit=20` -> activity objects with fields: `type`, `details`, `timestamp|created_at`

No backend schemas are available in the visible files; these contracts should be treated as drafts until the backend implementation is added.

