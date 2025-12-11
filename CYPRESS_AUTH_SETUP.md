# Cypress Authentication Setup

## Quick Setup Guide

### Step 1: Create Test User Account

Before running tests, you need to create a test user account in your Supabase database:

1. **Option A: Via the App UI**
   - Start your dev server: `npm run dev`
   - Go to `/login` in your browser
   - Click "Sign Up" (or "Registrovať sa")
   - Create an account with:
     - Email: `test@example.com` (or your preferred test email)
     - Password: `testpassword123` (or your preferred test password)
   - Confirm the email if required

2. **Option B: Via Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → Users
   - Click "Add User" → "Create new user"
   - Enter email and password
   - Click "Create User"

### Step 2: Configure Test Credentials

Create a `cypress.env.json` file in the project root:

```json
{
  "TEST_USER_EMAIL": "test@example.com",
  "TEST_USER_PASSWORD": "testpassword123"
}
```

**Important**: This file is already in `.gitignore` - it won't be committed to git.

### Step 3: Verify Login Works

1. Start dev server: `npm run dev`
2. Open Cypress: `npm run test:e2e:open`
3. Run a simple test to verify login works

---

## How It Works

All tests now automatically log in using the `cy.login()` command:

```javascript
beforeEach(() => {
  cy.login()  // Automatically logs in before each test
})
```

The login command:
1. Visits `/login`
2. Fills in email and password (from `cypress.env.json` or defaults)
3. Clicks "Sign In"
4. Waits for navigation away from login page

---

## Troubleshooting

### "Login failed" or "Invalid credentials"
- ✅ Verify test user exists in Supabase
- ✅ Check email/password in `cypress.env.json`
- ✅ Make sure email is confirmed (if email confirmation is enabled)
- ✅ Try logging in manually in the browser first

### "Cannot find login form"
- ✅ Check that `/login` route exists
- ✅ Verify selectors match your login form
- ✅ Check if login page uses different field names

### "Tests redirect to login"
- ✅ Verify login is successful (check Cypress logs)
- ✅ Check if session is being maintained
- ✅ Verify Supabase connection is working

---

## Alternative: Bypass Authentication (For Testing Only)

If you want to test without authentication, you can temporarily modify your app to allow unauthenticated access in development mode. However, this is **not recommended** for production-like testing.

---

## Next Steps

1. Create test user account
2. Create `cypress.env.json` with credentials
3. Run `npm run test:e2e:open`
4. Test should now work! 🎉

