# Saurav Gusain — Video Editor Portfolio

A cinematic Next.js portfolio with a protected admin area, PostgreSQL project/category storage, and Neon Object Storage media uploads.

## Requirements

- Node.js 20 LTS or newer and npm
- PostgreSQL (Neon or another PostgreSQL host)
- For media uploads: a Neon Object Storage bucket named `uploads` and a credential with the `storage:write` scope (which includes reads)

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
- `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` — Neon Object Storage credentials; keep these server-side and configure them locally and in Netlify.
- `AWS_S3_BUCKET` — bucket name; defaults to `uploads`.

The upload endpoint supports JPEG/PNG/WebP images up to 8 MB and MP4/WebM videos up to 250 MB. The browser receives a short-lived signed upload URL; the storage credentials never enter the browser. Keep the Neon bucket private: the app issues short-lived signed reads only for assets referenced by published projects.

## Database and admin

The initial schema and editable starting categories are in `drizzle/0000_initial.sql`; inquiries and clearly labeled demo projects are added by `drizzle/0001_inquiries_and_demo_work.sql`. Apply all SQL migrations with `npm run db:migrate`. Project create/publish/feature/delete and category create/delete are available under `/admin`; API operations require an authenticated server session. Public pages query published projects only. Draft detail routes return 404.

## Free hosting and automatic deploys

Netlify supports this Next.js app and can deploy it from the GitHub repository. Connect the repository, choose `main` as the production branch, and each push to `main` will trigger a production deploy. Add production environment variables in the Netlify project settings; never commit them to Git.

The admin panel needs a persistent PostgreSQL database. Create a free database with a provider such as Neon, then set `DATABASE_URL` in Vercel. Before first use, run `npm run db:migrate` once against that production database. Set `SESSION_SECRET` to a random secret of 32 or more characters and `ADMIN_SETUP_TOKEN` to a separate one-time value in Vercel's project environment settings. Visit `/admin`, select initial setup, create the admin, then remove `ADMIN_SETUP_TOKEN` from Vercel and redeploy. Never commit `.env.local` or real secrets.

For directly hosted video files, Neon Object Storage is used for object bytes and Neon PostgreSQL stores project content plus uploaded file metadata. In Netlify, add the four `AWS_*` storage variables and `AWS_S3_BUCKET=uploads` under Site configuration → Environment variables. Add the same values to `.env.local` for local development. Do not commit storage credentials. Run `npm run db:migrate` against the same Neon database to add the media metadata table. Neon Object Storage buckets are private by default; this app signs reads on the server for published media, so no public bucket access change is needed. If you prefer a simpler video workflow and accept YouTube branding, use YouTube share/embed links instead.

For long master videos, keep the 1–2 GB file in Google Drive and upload only a short preview clip for the portfolio card. In Admin → Works, paste the Drive share URL into “Full video link”; it is saved separately from the card preview. The project page embeds Drive's preview player when the link is a Drive file link and shows a link to open the original if Drive playback is unavailable. Set the Drive file's General access to “Anyone with the link” as Viewer. Drive playback can take time to process, is limited to 1080p, and anonymous playback can be rate-limited; a dedicated video host/CDN is more reliable for a public portfolio.

The app does not use persistent local filesystem storage for uploads. Video and image objects live in Neon Object Storage, while PostgreSQL stores their metadata and the project URLs. Netlify's ephemeral runtime filesystem is not used for user uploads.

## Notes

The initial personal copy, software list, and service offerings are editable placeholders/design copy and should be reviewed. Contact email/social links remain unset until real details are supplied. No email form is presented as successfully sent. Replace the abstract hero and portrait treatments with supplied media when available.

## Contact queries and demonstration content

The contact form collects name, email, mobile number, and query text. Valid submissions are stored in the `inquiries` table and appear in the protected Admin → Queries section, where they can be marked read. No email is sent. `npm run db:migrate` applies both the initial schema and the follow-up inquiries/demo-work migration. The included demo projects use clearly labeled placeholder artwork and sample footage; replace or unpublish them before presenting the portfolio as real client work.

The admin sign-in page includes a **Preview the dashboard (read-only)** option for viewing the dashboard layout without database credentials. It uses sample data and cannot change projects or queries.
