# Dinlio AI

## GitHub'a yükleme
Repo'nun KÖKÜNDE şunlar görünmeli: `package.json`, `app/`, `lib/`, `components/`, `tailwind.config.ts`.
`.env.local` dosyasını GitHub'a YÜKLEME (içinde admin şifresi var).

## Vercel → Settings → Environment Variables
ADMIN_USERNAME, ADMIN_PASSWORD
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_WEBHOOK_BASE = https://<vercel-adresin>/api/webhook
FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
(Private key'i tırnaksız, içindeki \n'lerle birlikte tek satır yapıştır.)
Değişken ekledikten sonra Redeploy et.
