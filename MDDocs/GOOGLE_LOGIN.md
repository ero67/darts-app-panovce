# Google Login Setup

This app uses Supabase OAuth to sign in with Google. The frontend calls `supabase.auth.signInWithOAuth({ provider: 'google' })` and redirects users back to the current site after Google completes authentication.

## Prerequisites
- `.env.local` (or equivalent) has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for your project.
- You have access to the Supabase project and a Google Cloud project.

## Configure Google in Supabase
1. In Supabase Dashboard go to **Authentication → Providers → Google**.
2. In Google Cloud Console, create an **OAuth 2.0 Client ID (Web application)**.
   - Authorized redirect URIs should include `https://<your-project>.supabase.co/auth/v1/callback` and (for local dev) `http://localhost:5173/auth/v1/callback`.
   - Authorized JavaScript origins should include your app origins (e.g., `http://localhost:5173` and your production domain).
3. Copy the **Client ID** and **Client secret** into Supabase's Google provider settings and enable the provider.
4. In Supabase **Authentication → URL Configuration**, ensure **Site URL** includes your production domain and **Additional Redirect URLs** include `http://localhost:5173` for local testing.

## How it behaves in the app
- Clicking "Continue with Google" triggers Supabase OAuth; Supabase handles the external redirect.
- After Google sign-in, Supabase returns the user to `window.location.origin` (current site). The `AuthContext` picks up the session via `supabase.auth.getSession()`/`onAuthStateChange`.
- Admin roles are still assigned in Supabase manually (if applicable for your project).

## Quick test
1. Start the app locally (`npm run dev`) and open `/login`.
2. Click **Continue with Google** and complete the Google flow.
3. You should land back on the app with a Supabase session present (check via the UI or browser devtools → Application → Cookies/Local Storage).

If the button reports an error or hangs, recheck the redirect URIs, origins, and that the Google provider is enabled in Supabase.

