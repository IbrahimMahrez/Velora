import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Legal.css";

const content = {
  en: {
    eyebrow: "LEGAL",
    title: "Terms of Service",
    updated: "Last updated: 2026",
    sections: [
      {
        h: "1. The service",
        p: "Velora provides a personal finance workspace for tracking expenses, bills, subscriptions, installments and savings goals, with AI-powered insights.",
      },
      {
        h: "2. Your account",
        p: "You are responsible for keeping your credentials secure and for all activity under your account. You must provide accurate information when registering.",
      },
      {
        h: "3. Plans and billing",
        p: "Velora offers Free, Premium and Family plans. Paid plans renew per the selected billing cycle and can be cancelled at any time from the Plans page.",
      },
      {
        h: "4. Acceptable use",
        p: "You may not abuse the service, attempt unauthorized access, upload malicious files, or use Velora for unlawful purposes. Violations may lead to suspension.",
      },
      {
        h: "5. Liability",
        p: "Velora is provided as-is. Insights are informational and not financial advice. We are not liable for decisions made based on the service.",
      },
    ],
    back: "Back to home",
  },
  ar: {
    eyebrow: "قانوني",
    title: "شروط الاستخدام",
    updated: "آخر تحديث: 2026",
    sections: [
      {
        h: "1. الخدمة",
        p: "فيلورا بتقدم مساحة مالية شخصية لتتبع المصاريف والفواتير والاشتراكات والأقساط وأهداف الادخار، مع تحليلات بالذكاء الاصطناعي.",
      },
      {
        h: "2. حسابك",
        p: "انت مسؤول عن الحفاظ على بيانات دخولك وعن كل النشاط على حسابك. ولازم تقدم معلومات صحيحة عند التسجيل.",
      },
      {
        h: "3. الخطط والدفع",
        p: "فيلورا فيها خطط مجانية وبريميوم وعائلية. الخطط المدفوعة بتتجدد حسب دورة الدفع المختارة وتقدر تلغيها في أي وقت من صفحة الخطط.",
      },
      {
        h: "4. الاستخدام المقبول",
        p: "ممنوع إساءة استخدام الخدمة أو محاولة الوصول غير المصرح أو رفع ملفات ضارة أو استخدام فيلورا لأغراض غير قانونية. المخالفة ممكن تؤدي لإيقاف الحساب.",
      },
      {
        h: "5. المسؤولية",
        p: "فيلورا مقدمة كما هي. التحليلات معلومات استرشادية وليست استشارة مالية. ولسنا مسؤولين عن القرارات المبنية على الخدمة.",
      },
    ],
    back: "رجوع للرئيسية",
  },
};

function Terms() {
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
          <FileText size={14} />
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

export default Terms;
