import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Legal.css";

const content = {
  en: {
    eyebrow: "LEGAL",
    title: "Privacy Policy",
    updated: "Last updated: 2026",
    sections: [
      {
        h: "1. What we collect",
        p: "Velora collects your account information (name, email, password hash) and the financial data you enter (expenses, bills, subscriptions, installments, savings goals) to operate your workspace.",
      },
      {
        h: "2. How we use it",
        p: "Your data is used to provide the service, generate insights and reminders, and improve Velora. We never sell your personal or financial data.",
      },
      {
        h: "3. Security",
        p: "Passwords are hashed with bcrypt, sessions use short-lived JWT tokens, and admin areas require elevated privileges. Uploads are restricted to images with size limits.",
      },
      {
        h: "4. Your control",
        p: "You can update your profile, change your password, export your data by contacting support, or permanently delete your account from Settings at any time.",
      },
      {
        h: "5. Contact",
        p: "For privacy questions, contact us through the support channels listed in the application.",
      },
    ],
    back: "Back to home",
  },
  ar: {
    eyebrow: "قانوني",
    title: "سياسة الخصوصية",
    updated: "آخر تحديث: 2026",
    sections: [
      {
        h: "1. البيانات اللي بنجمعها",
        p: "فيلورا بتجمع بيانات حسابك (الاسم والبريد وكلمة سر مشفرة) والبيانات المالية اللي بتدخلها (مصاريف وفواتير واشتراكات وأقساط وأهداف ادخار) عشان تشغل مساحة عملك.",
      },
      {
        h: "2. بنستخدمها إزاي",
        p: "بياناتك بتستخدم لتقديم الخدمة وعمل التحليلات والتذكيرات وتطوير فيلورا. مش بنبيع بياناتك الشخصية أو المالية أبداً.",
      },
      {
        h: "3. الأمان",
        p: "كلمات السر مشفرة، والجلسات برموز قصيرة المدة، ومناطق الإدارة محتاجة صلاحيات عالية. والملفات المرفوعة مقتصرة على الصور بحجم محدود.",
      },
      {
        h: "4. تحكمك في بياناتك",
        p: "تقدر تحدث ملفك الشخصي وتغير كلمة السر وتطلب نسخة من بياناتك من الدعم، أو تحذف حسابك نهائياً من الإعدادات في أي وقت.",
      },
      {
        h: "5. تواصل معانا",
        p: "لأي سؤال عن الخصوصية تواصل معانا من قنوات الدعم الموجودة في التطبيق.",
      },
    ],
    back: "رجوع للرئيسية",
  },
};

function Privacy() {
  const { lang } = useLanguage();
  const c = content[lang] || content.en;

  return (
    <main className="legal-page">
      <div className="legal-top">
        <Link to="/" className="legal-back">
          ← {c.back}
        </Link>
        <LanguageToggle />
      </div>

      <div className="legal-card">
        <div className="legal-eyebrow">
          <ShieldCheck size={14} />
          {c.eyebrow}
        </div>

        <h1>{c.title}</h1>
        <p className="legal-updated">{c.updated}</p>

        {c.sections.map((s) => (
          <section key={s.h}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}

export default Privacy;
