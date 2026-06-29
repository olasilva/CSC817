# FRD-08 — Settings

## 1. Overview
Settings are currently mostly **static UI** with minimal behavior.

Implemented in `public/settings.html`.

## 2. Functional Requirements
### 2.1 Profile Information
- Username input (`setUsername`) default `admin`
- Email input (`setEmail`) default `admin@inventory.com`
- Role field is disabled and displays `Administrator`.

Save behavior:
- Clicking “Save Changes” triggers `saveProfile()`.
- It displays an `alert()` with username and email.
- No persistence to localStorage or backend is implemented.

### 2.2 Notification toggles
- Low Stock Alerts (checked by default)
- Checkout Notifications (checked by default)
- Restock Reminders (unchecked by default)
- Email Reports (unchecked by default)

Requirement:
- Toggling checkboxes does not persist.

### 2.3 System information
Static values:
- Version `2.1.0`
- Last Updated `2024-12-10`
- API Status label `● Connected` (static)

