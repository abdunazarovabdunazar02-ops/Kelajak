# Netlify'ga joylash
1. Papkani GitHub'ga yuklang → netlify.com → Add new site → Import from Git (yoki: `npm i -g netlify-cli && netlify deploy --prod`).
2. Site settings → Environment variables:
   - ADMIN_PASSWORD = kuchli parol (16+ belgi)
   - SESSION_SECRET = uzun tasodifiy matn (`openssl rand -hex 32`)
3. Deploy qiling. Parolni almashtirish: ADMIN_PASSWORD'ni o‘zgartirib, qayta deploy qiling.
