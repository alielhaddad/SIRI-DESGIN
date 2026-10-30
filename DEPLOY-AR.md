# تشغيل ونشر موقع Siri Designs

## أولًا: إعداد قاعدة البيانات (مرة واحدة)

1. افتح [supabase.com](https://supabase.com) وأنشئ مشروعًا جديدًا.
2. من القائمة افتح **SQL Editor** ثم **New query**.
3. افتح الملف `supabase-schema.sql` الموجود داخل هذا المجلد، وانسخ محتواه بالكامل إلى محرر SQL واضغط **Run**.
4. افتح **Authentication → Users** واضغط **Add user** لإنشاء حساب المدير بالبريد الإلكتروني وكلمة مرور قوية.
5. من إعدادات **Authentication / Sign In** عطّل تسجيل المستخدمين الجدد (Public sign-ups). لا تنشئ حسابات إلا للأشخاص المسموح لهم بإدارة الموقع.
6. افتح **Project Settings → API** وانسخ:
   - **Project URL**
   - **anon / public key**

## ثانيًا: النشر على Vercel من غير GitHub

1. فك ضغط `siri-designs-site.zip` في مجلد على جهازك.
2. ثبّت Node.js إصدار 22 إن لم يكن موجودًا.
3. افتح المجلد المستخرج، ثم اضغط على شريط العنوان في File Explorer واكتب `powershell` واضغط Enter.
4. في PowerShell نفّذ:

   ```powershell
   npm install
   npx vercel
   ```

5. سجّل الدخول إلى Vercel من المتصفح، ووافق على ربط المشروع عند ظهور الأسئلة.
6. بعد إنشاء المشروع افتح Vercel → مشروعك → **Settings → Environment Variables** وأضف المتغيرين التاليين للبيئات المطلوبة (Production وPreview وDevelopment):

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```

   ضع القيم الحقيقية التي نسختها من Supabase بدل النصوص التوضيحية.
7. ارجع إلى PowerShell ونفّذ:

   ```powershell
   npx vercel --prod
   ```

   أو أعد النشر من صفحة Deployments في Vercel بعد حفظ متغيرات البيئة.

## ثالثًا: إدارة الموقع

- افتح رابط الموقع المنشور.
- افتح `https://رابط-موقعك.vercel.app/admin`.
- سجّل الدخول ببريد وكلمة مرور المدير اللذين أنشأتهما في Supabase.
- من **بيانات الشركة** أضف الهاتف وواتساب والبريد والعنوان وروابط السوشيال ميديا.
- من **سابقة الأعمال** أضف المشروعات وارفع صورها.
- من **العملاء** أضف أسماء العملاء أو الشركات وشعاراتهم، واختر عرضها على الموقع.
- من **طلبات العملاء** تابع طلبات عروض الأسعار وحدّث حالتها.

## تنبيه أمان مهم

لا تضع مفتاح `service_role` في Vercel أو في ملفات الموقع. استخدم فقط `anon / public key`. أبقِ التسجيل العام مغلقًا، ولا تشارك بيانات دخول لوحة الإدارة. نموذج طلب عرض السعر يحفظ الطلبات داخل Supabase ولا يرسل إشعارات بريد إلكتروني تلقائيًا في هذه النسخة.
