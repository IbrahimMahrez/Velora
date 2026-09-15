import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Receipt,
  CalendarClock,
  CreditCard,
  Target,
} from "lucide-react";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";
import "./Calendar.css";

const TYPE_META = {
  bill: { icon: Receipt, className: "bill" },
  installment: { icon: CalendarClock, className: "installment" },
  subscription: { icon: CreditCard, className: "subscription" },
  goal: { icon: Target, className: "goal" },
};

const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const parseKey = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return toKey(d);
};

function Calendar() {
  const { t, lang } = useLanguage();
  const { formatMoney } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const today = new Date();
  const [cursor, setCursor] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  });
  const [selected, setSelected] = useState(toKey(today));

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError("");

        const [billsRes, instRes, subsRes, goalsRes] =
          await Promise.allSettled([
            api.get("/bills", { params: { limit: 200 } }),
            api.get("/installments", { params: { limit: 200 } }),
            api.get("/subscription"),
            api.get("/goal"),
          ]);

        const collected = [];

        if (billsRes.status === "fulfilled") {
          const bills = Array.isArray(billsRes.value.data?.bills)
            ? billsRes.value.data.bills
            : [];
          bills.forEach((b) => {
            const key = parseKey(b.dueDate);
            if (!key) return;
            collected.push({
              id: `bill-${b._id}`,
              dateKey: key,
              type: "bill",
              title: b.title || "Bill",
              amount: Number(b.amount) || 0,
              extra: b.status || "",
            });
          });
        }

        if (instRes.status === "fulfilled") {
          const list =
            instRes.value.data?.installments ||
            instRes.value.data?.data ||
            [];
          (Array.isArray(list) ? list : []).forEach((item) => {
            const key = parseKey(item.nextPaymentDate);
            if (!key) return;
            collected.push({
              id: `inst-${item._id}`,
              dateKey: key,
              type: "installment",
              title: item.productName || item.title || "Installment",
              amount: Number(item.monthlyPayment) || 0,
              extra: item.status || "",
            });
          });
        }

        if (subsRes.status === "fulfilled") {
          const list = Array.isArray(
            subsRes.value.data?.subscriptions
          )
            ? subsRes.value.data.subscriptions
            : [];
          list.forEach((s) => {
            const key = parseKey(s.renewalDate);
            if (!key) return;
            collected.push({
              id: `sub-${s._id}`,
              dateKey: key,
              type: "subscription",
              title: s.name || "Subscription",
              amount: Number(s.price) || 0,
              extra: s.renewalCycle || "",
            });
          });
        }

        if (goalsRes.status === "fulfilled") {
          const list = Array.isArray(
            goalsRes.value.data?.savingGoals
          )
            ? goalsRes.value.data.savingGoals
            : [];
          list.forEach((g) => {
            const key = parseKey(g.deadline);
            if (!key || g.status === "cancelled") return;
            collected.push({
              id: `goal-${g._id}`,
              dateKey: key,
              type: "goal",
              title: g.title || "Goal",
              amount: Number(g.targetAmount) || 0,
              extra: g.status || "",
            });
          });
        }

        setEvents(collected);
      } catch (err) {
        setError(
          err.response?.data?.message || t("calendar.loadError")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { weeks, weekdays, monthLabel, monthEvents } = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    // Monday-start grid
    const lead = (first.getDay() + 6) % 7;
    const start = new Date(cursor.y, cursor.m, 1 - lead);

    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + i
      );
      cells.push({
        key: toKey(d),
        day: d.getDate(),
        inMonth: d.getMonth() === cursor.m,
        isToday: toKey(d) === toKey(today),
      });
    }

    const weekRows = [];
    for (let w = 0; w < 6; w++) {
      weekRows.push(cells.slice(w * 7, w * 7 + 7));
    }

    // Monday..Sunday labels in current locale
    const monday = new Date(2026, 8, 7); // a Monday
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(
        monday.getFullYear(),
        monday.getMonth(),
        monday.getDate() + i
      );
      days.push(d.toLocaleDateString(locale, { weekday: "short" }));
    }

    const label = first.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    const prefix = `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`;
    const inMonth = events.filter((e) =>
      e.dateKey.startsWith(prefix)
    );

    return {
      weeks: weekRows,
      weekdays: days,
      monthLabel: label,
      monthEvents: inMonth,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, events, locale]);

  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!map[e.dateKey]) map[e.dateKey] = [];
      map[e.dateKey].push(e);
    });
    return map;
  }, [events]);

  const selectedEvents = byDay[selected] || [];

  const monthTotals = useMemo(() => {
    const totals = { bill: 0, installment: 0, subscription: 0 };
    monthEvents.forEach((e) => {
      if (totals[e.type] !== undefined) {
        totals[e.type] += Number(e.amount) || 0;
      }
    });
    return totals;
  }, [monthEvents]);

  const moveMonth = (delta) => {
    setCursor((prev) => {
      const d = new Date(prev.y, prev.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  };

  const goToday = () => {
    const now = new Date();
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
    setSelected(toKey(now));
  };

  return (
    <main className="calendar-page">
      <div className="calendar-topbar">
        <Link to="/dashboard" className="back-dashboard-btn">
          <ArrowLeft size={18} />
          <span>{t("calendar.back")}</span>
        </Link>
        <LanguageToggle variant="dashboard" />
      </div>

      <header className="calendar-header">
        <div>
          <p className="calendar-eyebrow">{t("calendar.eyebrow")}</p>
          <h1>{t("calendar.title")}</h1>
          <p className="calendar-subtitle">{t("calendar.subtitle")}</p>
        </div>

        <div className="calendar-nav">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="prev">
            <ChevronLeft size={18} />
          </button>
          <strong>{monthLabel}</strong>
          <button type="button" onClick={() => moveMonth(1)} aria-label="next">
            <ChevronRight size={18} />
          </button>
          <button
            type="button"
            className="calendar-today-btn"
            onClick={goToday}
          >
            {t("calendar.today")}
          </button>
        </div>
      </header>

      {loading ? (
        <div className="calendar-state">
          <div className="calendar-loader" />
          <span>{t("calendar.loading")}</span>
        </div>
      ) : error ? (
        <div className="calendar-state">
          <p className="calendar-error-text">{error}</p>
          <button
            type="button"
            className="calendar-today-btn"
            onClick={() => window.location.reload()}
          >
            {t("calendar.tryAgain")}
          </button>
        </div>
      ) : (
        <>
          <section className="calendar-stats">
            {["bill", "installment", "subscription"].map((type) => {
              const Meta = TYPE_META[type];
              return (
                <div key={type} className={`calendar-stat ${type}`}>
                  <Meta.icon size={17} />
                  <div>
                    <span>{t(`calendar.stat${type[0].toUpperCase()}${type.slice(1)}`)}</span>
                    <strong>{formatMoney(monthTotals[type])}</strong>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="calendar-grid-card">
            <div className="calendar-weekdays">
              {weekdays.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {weeks.flat().map((cell) => {
                const dayEvents = byDay[cell.key] || [];
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelected(cell.key)}
                    className={[
                      "calendar-day",
                      cell.inMonth ? "" : "outside",
                      cell.isToday ? "today" : "",
                      selected === cell.key ? "selected" : "",
                    ].join(" ")}
                  >
                    <span className="calendar-day-num">{cell.day}</span>
                    {dayEvents.length > 0 && (
                      <span className="calendar-dots">
                        {dayEvents.slice(0, 3).map((e) => (
                          <i key={e.id} className={`dot ${e.type}`} />
                        ))}
                        {dayEvents.length > 3 && (
                          <em>+{dayEvents.length - 3}</em>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="calendar-day-list">
            <h3>
              {t("calendar.selectedDay")}:{" "}
              {(() => {
                const [y, m, d] = selected.split("-").map(Number);
                return new Date(y, m - 1, d).toLocaleDateString(locale, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
              })()}
            </h3>

            {selectedEvents.length === 0 ? (
              <p className="calendar-empty">{t("calendar.noEvents")}</p>
            ) : (
              selectedEvents.map((e) => {
                const Meta = TYPE_META[e.type] || TYPE_META.bill;
                return (
                  <div key={e.id} className="calendar-event">
                    <span className={`event-icon ${Meta.className}`}>
                      <Meta.icon size={15} />
                    </span>
                    <div>
                      <strong>{e.title}</strong>
                      <small>
                        {t(`calendar.type${e.type[0].toUpperCase()}${e.type.slice(1)}`)}
                        {e.extra ? ` • ${e.extra}` : ""}
                      </small>
                    </div>
                    {e.amount > 0 && (
                      <strong className="event-amount">
                        {formatMoney(e.amount)}
                      </strong>
                    )}
                  </div>
                );
              })
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default Calendar;
