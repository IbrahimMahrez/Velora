import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import "./NotFound.css";

function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-icon">
          <Compass size={28} />
        </div>

        <span className="notfound-code">404</span>

        <h1>{t("notFound.title")}</h1>
        <p>{t("notFound.description")}</p>

        <div className="notfound-actions">
          <Link to="/" className="notfound-home">
            {t("notFound.home")}
          </Link>

          <Link to="/dashboard" className="notfound-dash">
            {t("notFound.dashboard")}
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFound;
