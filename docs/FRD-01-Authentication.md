# FRD-01 — Authentication (Client-side Demo)

## 1. Overview
The system authenticates users using a **client-side demo check** (no server authentication). Successful login creates a local session in the browser and redirects the user to `dashboard.html`.

## 2. Users & Roles
- **Demo user**: Email `admin@oren.com`, Password `golden123`.
- Stored role label (static): `Administrator`.

## 3. Entry Points
- `public/auth.html`

## 4. Functional Requirements
### 4.1 Session check on page load
- On `auth.html` load:
  - If `localStorage.stockflow_auth === 'true'` then redirect to `dashboard.html`.

### 4.2 Login form
The login form contains:
- `emailInput` (type email) with default value `admin@oren.com`
- `passwordInput` (type password) with default value `golden123`
- Submit button `loginForm`

### 4.3 Input validation rules
Before authenticating:
- Email must be non-empty.
- Password must be non-empty.
- Email must contain `@` and `.`.

On validation failure:
- Show an animated error message (shake card + banner).
- Password input is cleared only when authentication fails (not when validation fails).

### 4.4 Authentication behavior
Authentication is simulated with a **~1500ms delay**.
- If `email === 'admin@oren.com'` AND `password === 'golden123'`:
  - Authentication succeeds.
- Otherwise:
  - Authentication fails with message: `Invalid email or password. Please use demo credentials above.`

### 4.5 Success behavior
On success:
- Persist session:
  - `localStorage.stockflow_auth = 'true'`
  - `localStorage.stockflow_user = JSON.stringify({ email, name: 'Oren Admin', loginTime })`
- Update button UI to show success.
- Redirect to `dashboard.html` after ~700ms.

### 4.6 Failure behavior
On failure:
- Re-enable the button and reset loading state.
- Show error banner with message.
- Clear `passwordInput` and focus it.

### 4.7 Network error behavior
The code catches unexpected errors and shows:
- `Network error. Please check your connection.`

## 5. Data Storage (Client)
### Keys
- `stockflow_auth` (string `'true'`)
- `stockflow_user` (JSON)

### Value schema
```json
{
  "email": "string",
  "name": "string",
  "loginTime": "ISO-8601 string"
}
```

## 6. Non-Functional Requirements
- No server calls.
- Session is browser-local; clearing storage logs out.

## 7. Observability
- Failures are visible in UI.
- Network errors are `console.error` logged.

