# Saurav Gusain — Video Editor Portfolio

A cinematic Next.js portfolio with a protected admin area, PostgreSQL project/category storage, and optional Cloudflare R2 media uploads.

## Requirements

- Node.js 20 LTS or newer and npm
- PostgreSQL (Neon or another PostgreSQL host)
- For media uploads: Cloudflare R2 bucket and a public custom domain/base URL

## Setup

```sh
npm install
cp .env.example .env.local
```

Set `DATABASE_URL`, a random `SESSION_SECRET` of at least 32 characters, and `ADMIN_SETUP_TOKEN` to a long random one-time value. Run `npm run db:migrate` then `npm run dev`. Open `/admin`, choose “First time? Configure the initial admin,” and provision the first administrator with the setup token. The setup endpoint refuses to create another admin once one exists. Remove/rotate `ADMIN_SETUP_TOKEN` after setup.

## Environment

- `DATABASE_URL` — PostgreSQL connection string (required for project management)
- `SESSION_SECRET` — secret for encrypted, HttpOnly admin sessions (required in production)
- `ADMIN_SETUP_TOKEN` — one-time secret for initial admin provisioning
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_BASE_URL` — optional; configure all to enable media uploads. Configure bucket CORS to allow PUT from the portfolio origin for `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, and `video/webm`.

The upload endpoint supports images up to 8 MB and MP4/WebM video up to 250 MB, using short-lived signed uploads. R2 egress, storage, and free allowances depend on current provider terms; verify the account's limits.

## Database and admin

The initial schema and editable starting categories are in `drizzle/0000_initial.sql`; inquiries and clearly labeled demo projects are added by `drizzle/0001_inquiries_and_demo_work.sql`. Apply all SQL migrations with `npm run db:migrate`. Project create/publish/feature/delete and category create/delete are available under `/admin`; API operations require an authenticated server session. Public pages query published projects only. Draft detail routes return 404.

## Free hosting and automatic deploys

For a personal, non-commercial portfolio, Vercel Hobby is the simplest host for this Next.js app. Connect the GitHub repository to a Vercel project and set its production branch to `main`. Vercel will build and deploy each push to `main`; pushes to other branches get preview deployments. A connected Git provider, Vercel account, and production environment variables are required. Vercel Hobby is for personal, non-commercial use; check its current terms before using it for paid/commercial work.

The admin panel needs a persistent PostgreSQL database. Create a free database with a provider such as Neon, then set `DATABASE_URL` in Vercel. Before first use, run `npm run db:migrate` once against that production database. Set `SESSION_SECRET` to a random secret of 32 or more characters and `ADMIN_SETUP_TOKEN` to a separate one-time value in Vercel's project environment settings. Visit `/admin`, select initial setup, create the admin, then remove `ADMIN_SETUP_TOKEN` from Vercel and redeploy. Never commit `.env.local` or real secrets.

For directly hosted video files, Cloudflare R2 is a good portfolio fit: its current free tier includes 10 GB-month of Standard storage, 1 million Class A requests, and 10 million Class B requests per month, with no egress charge. Configure a public custom domain/base URL and the R2 credentials listed above to enable uploads from Admin → Works & videos. Usage beyond the free tier can cost money. If you prefer a simpler free option and accept YouTube branding, upload videos as Unlisted on YouTube and use their share/embed links; anyone with the link can watch them, so do not use this for private footage.

Vercel does not provide persistent local file storage for uploads. Keep video files in R2 or a video host, not in the app filesystem. Once a GitHub repository is connected under Vercel → New Project, automatic deployment is enabled for the configured production branch; no separate deployment workflow file is needed.

## Notes

The initial personal copy, software list, and service offerings are editable placeholders/design copy and should be reviewed. Contact email/social links remain unset until real details are supplied. No email form is presented as successfully sent. Replace the abstract hero and portrait treatments with supplied media when available.

## Contact queries and demonstration content

The contact form collects name, email, mobile number, and query text. Valid submissions are stored in the `inquiries` table and appear in the protected Admin → Queries section, where they can be marked read. No email is sent. `npm run db:migrate` applies both the initial schema and the follow-up inquiries/demo-work migration. The included demo projects use clearly labeled placeholder artwork and sample footage; replace or unpublish them before presenting the portfolio as real client work.

The admin sign-in page includes a **Preview the dashboard (read-only)** option for viewing the dashboard layout without database credentials. It uses sample data and cannot change projects or queries.
