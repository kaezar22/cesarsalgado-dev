# cesarsalgado.dev

Personal site of César Salgado, built with Next.js and deployed on Vercel.

- `/` English, `/es` Spanish
- Cesar-Bot chat at `/api/chat` (DeepSeek, streaming)

## Edit content

- Texts, projects, music and testimonials: `lib/content.ts`
- What Cesar-Bot knows: `lib/profile.ts` (CV + personal summary)
- Pictures: `public/projects/` (16:10), CVs: `public/cv/`
- Styles: `app/globals.css`

## Run on your computer

```bash
npm install
copy .env.example .env.local     # then put your DEEPSEEK_API_KEY in .env.local
npm run dev                      # open http://localhost:3000
```

## Deploy

1. Push this folder to a new GitHub repo.
2. On vercel.com: Add New → Project → import the repo (framework: Next.js, defaults are fine).
3. Settings → Environment Variables: add `DEEPSEEK_API_KEY`.
4. Settings → Domains: add `cesarsalgado.dev` and copy the DNS records Vercel shows into Porkbun (DNS).

Every push to `main` redeploys automatically.
