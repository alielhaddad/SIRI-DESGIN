# Siri Designs — Website + Admin Dashboard

A modern Arabic RTL website for Siri Designs (interior design, finishing and décor), built with Next.js 15, React 19 and Supabase. The supplied Siri Designs logo is included at `public/logo.png`.

## Included

- Responsive Arabic website for desktop and mobile.
- Home, about, services, project portfolio, clients, contact and quote-request sections.
- Admin login at `/admin` using Supabase Auth.
- Admin management for customer requests and their statuses.
- Add/edit/delete projects, publish or hide projects, and upload project photos directly from the dashboard.
- Add/edit/delete clients and upload client logos.
- Edit phone, WhatsApp, email, address, company introduction and social links.
- Supabase Row Level Security policies. Public visitors can submit enquiries and read only published projects, active clients and public company settings. Only authenticated users can manage content and read customer requests.

## 1. Create and configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor**, create a new query, paste the entire `supabase-schema.sql` file and run it.
3. Open **Authentication → Users** and create the administrator user (email + strong password).
4. In **Authentication → Sign In / Providers**, disable public email sign-ups. Keep admin account creation restricted to the project owner.
5. In **Project Settings → API**, copy the **Project URL** and **anon/public key**.

> Do not put the Supabase `service_role` key in the website or in any `NEXT_PUBLIC_` variable.

## 2. Configure locally (optional)

Copy `.env.example` to `.env.local`, then fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`; dashboard: `http://localhost:3000/admin`.

## 3. Deploy to Vercel

1. Extract this ZIP on your computer.
2. **بدون GitHub (باستخدام Vercel CLI):** افتح PowerShell داخل مجلد المشروع، ثم شغّل `npm install` ثم `npx vercel`. سجّل الدخول إلى حساب Vercel واتبع خطوات ربط المشروع. بعد إعداد متغيرات البيئة كما بالأسفل شغّل `npx vercel --prod`.

   **أو عبر Git:** ارفع المجلد إلى مستودع Git ثم استورده من Vercel.
3. In Vercel → **Project → Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Redeploy after adding the variables.
5. Visit `https://YOUR-DOMAIN.vercel.app/admin` and sign in using the admin user you created in Supabase.
6. Use the **بيانات الشركة** tab to enter official contact details and social links. Use **سابقة الأعمال** and **العملاء** to populate the site.

## Notes

- The site can build without Supabase credentials, but dynamic content, form submission, admin login and image uploads require the Supabase project setup above.
- The image upload bucket is named `portfolio`; it is created by the SQL script and is public for image display. Uploading, replacing and deleting images requires an authenticated admin.
- The dashboard is a single-admin-style content manager. Any Supabase account with the `authenticated` role can manage data, so keep public sign-ups disabled and only create trusted admin accounts.
- Replace all company contact details and add real project/client content before sharing the website publicly.
- Customer enquiries are stored in Supabase. Configure your own operational process for responding to new leads; this project does not send email notifications automatically.
