
import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

import {
  App,
  Button,
  Col,
  ConfigProvider,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme as antdTheme,
} from "antd";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  TrendingDown,
  Receipt,
  Utensils,
  Car,
  ShoppingBag,
  Gamepad2,
  HeartPulse,
  GraduationCap,
  CircleHelp,
  AlertCircle,
  ArrowLeft,
  Download,
  Sparkles,
} from "lucide-react";
import { downloadCsv, datedFilename } from "../../utils/exportCsv";

import { motion, AnimatePresence } from "motion/react";

import "./Expenses.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const { Title, Text } = Typography;
const { TextArea } = Input;

const API_URL = "/expenses";

const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

const categoryIcons = {
  Food: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Entertainment: Gamepad2,
  Health: HeartPulse,
  Education: GraduationCap,
  Other: CircleHelp,
};

function Expenses() {
  const { notification, modal } = App.useApp();
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const [form] = Form.useForm();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  // =========================================
  // Notifications
  // =========================================

  const showSuccess = (title, description = "") => {
    notification.success({
      title,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  const showError = (title, description = "") => {
    notification.error({
      title,
      description,
      placement: "topRight",
      duration: 4,
    });
  };

  // =========================================
  // Fetch Expenses
  // =========================================

  const fetchExpenses = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const response = await api.get(API_URL, {
        params: {
          page: 1,
          limit: 50,
          _t: Date.now(),
        },

        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      setExpenses(response.data?.expenses || []);
    } catch (err) {
      console.log("EXPENSES ERROR:", err.response?.data);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Unable to load expenses.";

      showError("Unable to load expenses", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // =========================================
  // Add Modal
  // =========================================

  const openAddModal = () => {
    setEditingExpense(null);

    form.resetFields();

    form.setFieldsValue({
      category: "Other",
      date: new Date().toISOString().split("T")[0],
    });

    setShowModal(true);
  };

  // =========================================
  // Edit Modal
  // =========================================

  const openEditModal = (expense) => {
    if (!expense) return;

    setEditingExpense(expense);

    form.setFieldsValue({
      title: expense.title || "",
      amount: Number(expense.amount || 0),
      category: expense.category || "Other",
      date: expense.date
        ? new Date(expense.date).toISOString().split("T")[0]
        : "",
      notes: expense.notes || "",
    });

    setShowModal(true);
  };

  // =========================================
  // AI Category Suggestion
  // =========================================

  const handleSuggestCategory = async () => {
    const title = form.getFieldValue("title");

    if (!title || !String(title).trim()) {
      return;
    }

    try {
      setSuggesting(true);

      const response = await api.post("/ai/categorize", {
        title: String(title).trim(),
      });

      const suggested = response.data?.category;

      if (
        suggested &&
        CATEGORIES.includes(suggested)
      ) {
        form.setFieldsValue({ category: suggested });
      }
    } catch (err) {
      console.error(
        "AI suggest failed:",
        err.response?.data || err.message
      );
    } finally {
      setSuggesting(false);
    }
  };

  // =========================================
  // Close Modal
  // =========================================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingExpense(null);
    form.resetFields();
  };

  // =========================================
  // Add / Edit Expense
  // =========================================

  const handleSubmit = async (values) => {
    if (saving) return;

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("You are not logged in.");
      }

      const payload = {
        title: values.title.trim(),
        amount: Number(values.amount),
        category: values.category,
      };

      if (values.date) {
        payload.date = values.date;
      }

      if (values.notes?.trim()) {
        payload.notes = values.notes.trim();
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // =====================================
      // EDIT
      // =====================================

      if (editingExpense) {
        const response = await api.put(
          `${API_URL}/${editingExpense._id}`,
          payload,
          config
        );

        console.log("UPDATE SUCCESS:", response.data);

        const updatedExpense =
          response.data?.expense || response.data;

        if (
          !updatedExpense ||
          typeof updatedExpense !== "object"
        ) {
          throw new Error(
            "Invalid expense response from server."
          );
        }

        setExpenses((prev) =>
          prev.map((expense) =>
            expense?._id === editingExpense._id
              ? {
                  ...expense,
                  ...updatedExpense,
                  _id: expense._id,
                }
              : expense
          )
        );

        closeModal();

        showSuccess(
          "Expense updated",
          "Your expense has been updated successfully."
        );
      }

      // =====================================
      // ADD
      // =====================================

      else {
        const response = await api.post(
          API_URL,
          payload,
          config
        );

        console.log("CREATE SUCCESS:", response.data);

        const newExpense =
          response.data?.expense || response.data;

        if (
          !newExpense ||
          typeof newExpense !== "object"
        ) {
          throw new Error(
            "Invalid expense response from server."
          );
        }

        setExpenses((prev) => [
          newExpense,
          ...prev.filter(Boolean),
        ]);

        closeModal();

        showSuccess(
          "Expense added",
          "Your expense has been added successfully."
        );
      }
    } catch (err) {
      console.log(
        "SAVE EXPENSE ERROR:",
        err.response?.data
      );

      // Offline: the mutation is queued and will sync later —
      // report success instead of a confusing error.
      if (err.isQueued) {
        closeModal();

        showSuccess(
          t("common.savedOffline"),
          t("common.willSync")
        );

        return;
      }

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong.";

      showError(
        editingExpense
          ? "Unable to update expense"
          : "Unable to add expense",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // Delete Expense
  // =========================================

  const handleDelete = (expense) => {
    if (!expense?._id) return;

    modal.confirm({
      title: t("expenses.deleteTitle"),
      icon: <AlertCircle size={20} />,

      content: (
        <span>
          {t("expenses.deleteConfirm")}{" "}
          <strong>{expense.title}</strong>?
          <br />
          {t("expenses.deleteUndone")}
        </span>
      ),

      okText: t("common.delete"),
      cancelText: t("common.cancel"),

      okButtonProps: {
        danger: true,
      },

      async onOk() {
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("You are not logged in.");
          }

          await api.delete(
            `${API_URL}/${expense._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setExpenses((prev) =>
            prev.filter(
              (item) => item?._id !== expense._id
            )
          );

          showSuccess(
            "Expense deleted",
            "The expense has been removed successfully."
          );
        } catch (err) {
          console.log(
            "DELETE ERROR:",
            err.response?.data
          );

          const message =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            "Unable to delete expense.";

          showError(
            "Unable to delete expense",
            message
          );
        }
      },
    });
  };

  // =========================================
  // Filter
  // =========================================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (!expense) return false;

      const value = search.toLowerCase().trim();

      const title =
        expense.title?.toLowerCase() || "";

      const notes =
        expense.notes?.toLowerCase() || "";

      const matchesSearch =
        title.includes(value) ||
        notes.includes(value);

      const matchesCategory =
        category === "All" ||
        expense.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);

  // =========================================
  // Stats
  // =========================================

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense?.amount || 0),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = expenses
    .filter((expense) => {
      if (!expense?.date) return false;

      const date = new Date(expense.date);

      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear
      );
    })
    .reduce(
      (total, expense) =>
        total + Number(expense?.amount || 0),
      0
    );

  // =========================================
  // Helpers
  // =========================================

  const formatMoney = (value) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value || 0);

  const formatDate = (date) => {
    if (!date) return t("expenses.noDate");

    return new Date(date).toLocaleDateString(
      locale,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================
  // UI
  // =========================================

  return (
    <main className="expenses-page">

      {/* Back To Dashboard */}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Link
        to="/dashboard"
        className="back-dashboard-btn group"
      >
        <ArrowLeft
          size={18}
          className="transition-transform duration-300 group-hover:-translate-x-1"
        />

        <span>{t("expenses.back")}</span>
      </Link>
        <LanguageToggle variant="dashboard" />
      </div>

      {/* Header */}

      <header className="expenses-header">
        <div>
          <p className="expenses-eyebrow">
            {t("expenses.eyebrow")}
          </p>

          <h1>
            <span className="expenses-title-accent">{t("expenses.title")}</span>
          </h1>

          <Text className="expenses-subtitle">
            {t("expenses.subtitle")}
          </Text>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            icon={<Download size={16} />}
            onClick={() => {
              const rows = filteredExpenses.map((e) => ({
                title: e.title || "",
                amount: e.amount ?? "",
                category: e.category || "",
                date: e.date
                  ? new Date(e.date).toISOString().split("T")[0]
                  : "",
                notes: e.notes || "",
              }));
              downloadCsv(datedFilename("expenses"), rows);
            }}
          >
            {t("common.exportCsv")}
          </Button>
          <Button
            type="primary"
            icon={<Plus size={17} />}
            className="add-expense-btn"
            onClick={openAddModal}
          >
            {t("expenses.addExpense")}
          </Button>
        </div>
      </header>

      {/* =========================================
          STATS
      ========================================= */}

      <div className="expense-stats">

        {/* Total Expenses */}

        <motion.div
          className="expense-stat-motion"
          whileHover={{ y: -5 }}
        >
          <div className="expense-stat-card expense-stat-red">

            <div className="stat-icon">
              <Wallet size={26} />
            </div>

            <div className="stat-content">
              <span>{t("expenses.totalExpenses")}</span>

              <strong>
                {formatMoney(totalExpenses)}
              </strong>
            </div>

          </div>
        </motion.div>

        {/* This Month */}

        <motion.div
          className="expense-stat-motion"
          whileHover={{ y: -5 }}
        >
          <div className="expense-stat-card expense-stat-orange">

            <div className="stat-icon">
              <TrendingDown size={26} />
            </div>

            <div className="stat-content">
              <span>{t("expenses.thisMonth")}</span>

              <strong>
                {formatMoney(monthlyExpenses)}
              </strong>
            </div>

          </div>
        </motion.div>

        {/* Transactions */}

        <motion.div
          className="expense-stat-motion"
          whileHover={{ y: -5 }}
        >
          <div className="expense-stat-card expense-stat-blue">

            <div className="stat-icon">
              <Receipt size={26} />
            </div>

            <div className="stat-content">
              <span>{t("expenses.transactions")}</span>

              <strong>
                {expenses.length}
              </strong>
            </div>

          </div>
        </motion.div>

      </div>

      {/* =========================================
          TOOLBAR
      ========================================= */}

      <section className="expenses-toolbar glass-panel">

        <Input
          className="expense-search"
          prefix={<Search size={17} />}
          placeholder={t("expenses.searchPlaceholder")}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          allowClear
        />

        <Select
          className="expense-category-filter"
          value={category}
          onChange={setCategory}
          options={[
            {
              value: "All",
              label: t("expenses.allCategories"),
            },

            ...CATEGORIES.map((item) => ({
              value: item,
              label: item,
            })),
          ]}
        />

      </section>

      {/* =========================================
          EXPENSES
      ========================================= */}

      <section className="expenses-card glass-panel">

        <div className="expenses-card-header">
          <div>
            <h2>{t("expenses.recentExpenses")}</h2>

            <p>
              {filteredExpenses.length} {t("expenses.transactionsCount")}
            </p>
          </div>
        </div>

        {/* Loading */}

        {loading ? (
          <div className="expenses-state">

            <div className="expenses-loader" />

            <span>
              {t("expenses.loading")}
            </span>

          </div>
        ) : filteredExpenses.length === 0 ? (

          <div className="expenses-state">

            <Empty
              image={<Wallet size={38} />}
              description={
                search || category !== "All"
                  ? t("expenses.noMatching")
                  : t("expenses.noExpenses")
              }
            />

            {!search &&
              category === "All" && (
                <Button
                  type="primary"
                  icon={<Plus size={16} />}
                  onClick={openAddModal}
                >
                  {t("expenses.addExpense")}
                </Button>
              )}

          </div>

        ) : (

          <div className="expenses-list">

            <AnimatePresence>

              {filteredExpenses.map(
                (expense, index) => {

                  const Icon =
                    categoryIcons[
                      expense.category
                    ] || CircleHelp;

                  return (

                    <motion.div
                      key={expense._id}
                      className="expense-row glass-row"

                      initial={{
                        opacity: 0,
                        y: 12,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      exit={{
                        opacity: 0,
                        y: -10,
                      }}

                      transition={{
                        delay: index * 0.04,
                      }}
                    >

                      {/* Main */}

                      <div className="expense-main">

                        <div className="expense-category-icon">
                          <Icon size={18} />
                        </div>

                        <div>

                          <h3>
                            {expense.title}
                          </h3>

                          <div className="expense-meta">

                            <Tag>
                              {expense.category ||
                                "Other"}
                            </Tag>

                            <span>
                              {formatDate(
                                expense.date
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                      {/* Notes */}

                      <div className="expense-notes">
                        {expense.notes ||
                          t("expenses.noNotes")}
                      </div>

                      {/* Amount */}

                      <strong className="expense-amount">
                        -
                        {formatMoney(
                          expense.amount
                        )}
                      </strong>

                      {/* Actions */}

                      <Space className="expense-actions">

                        <Tooltip title={t("common.edit")}>
                          <Button
                            type="text"
                            icon={
                              <Pencil size={16} />
                            }
                            onClick={() =>
                              openEditModal(
                                expense
                              )
                            }
                          />
                        </Tooltip>

                        <Tooltip title={t("common.delete")}>
                          <Button
                            type="text"
                            danger
                            icon={
                              <Trash2 size={16} />
                            }
                            onClick={() =>
                              handleDelete(
                                expense
                              )
                            }
                          />
                        </Tooltip>

                      </Space>

                    </motion.div>
                  );
                }
              )}

            </AnimatePresence>

          </div>
        )}

      </section>

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      <Modal
        open={showModal}
        onCancel={closeModal}
        footer={null}
        centered
        forceRender
        className="expense-ant-modal"

        title={
          <div>

            <span className="modal-eyebrow">
              VELORA
            </span>

            <div className="modal-title">
              {editingExpense
                ? t("expenses.editExpense")
                : t("expenses.addExpenseTitle")}
            </div>

          </div>
        }
      >

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >

          {/* Title */}

          <Form.Item
            name="title"
            label={t("expenses.titleLabel")}

            rules={[
              {
                required: true,
                message:
                  t("expenses.titleRequired"),
              },

              {
                min: 3,
                message:
                  t("expenses.titleMin"),
              },
            ]}
          >
            <Input
              placeholder={t("expenses.titlePlaceholder")}
              size="large"
            />
          </Form.Item>

          {/* Amount + Category */}

          <Row gutter={12}>

            <Col xs={24} sm={12}>

              <Form.Item
                name="amount"
                label={t("expenses.amountLabel")}

                rules={[
                  {
                    required: true,
                    message:
                      t("expenses.amountRequired"),
                  },

                  {
                    type: "number",
                    min: 1,
                    message:
                      t("expenses.amountMin"),
                  },
                ]}
              >

                <InputNumber
                  size="large"
                  min={1}
                  style={{
                    width: "100%",
                  }}
                  placeholder="250"
                />

              </Form.Item>

            </Col>

            <Col xs={24} sm={12}>

              <Form.Item
                name="category"
                label={t("expenses.categoryLabel")}

                rules={[
                  {
                    required: true,
                    message:
                      t("expenses.categoryRequired"),
                  },
                ]}
              >

                <Select
                  size="large"
                  options={CATEGORIES.map(
                    (item) => ({
                      value: item,
                      label: item,
                    })
                  )}
                />

              </Form.Item>

              <Button
                type="link"
                size="small"
                icon={<Sparkles size={13} />}
                loading={suggesting}
                onClick={handleSuggestCategory}
                style={{
                  paddingLeft: 0,
                  marginTop: 4,
                }}
              >
                {suggesting
                  ? t("expenses.aiSuggesting")
                  : t("expenses.aiSuggest")}
              </Button>

            </Col>

          </Row>

          {/* Date */}

          <Form.Item
            name="date"
            label={t("expenses.dateLabel")}
          >
            <Input
              type="date"
              size="large"
            />
          </Form.Item>

          {/* Notes */}

          <Form.Item
            name="notes"
            label={t("expenses.notesLabel")}

            rules={[
              {
                min: 5,
                message:
                  t("expenses.notesMin"),
              },
            ]}
          >

            <TextArea
              rows={4}
              placeholder={t("expenses.notesPlaceholder")}
            />

          </Form.Item>

          {/* Actions */}

          <div className="expense-modal-actions">

            <Button
              size="large"
              onClick={closeModal}
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={saving}
            >
              {editingExpense
                ? t("expenses.saveChanges")
                : t("expenses.addExpense")}
            </Button>

          </div>

        </Form>

      </Modal>

    </main>
  );
}

// ===========================================
// Wrapper
// ===========================================

export default function ExpensesPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,

        token: {
          colorPrimary: "#ffffff",
          colorBgBase: "#050505",
          colorBgContainer: "#0b0b0b",
          colorText: "#ffffff",
          colorTextSecondary:
            "rgba(255,255,255,0.5)",

          colorBorder:
            "rgba(255,255,255,0.1)",

          borderRadius: 14,
        },
      }}
    >
      <App>
        <Expenses />
      </App>
    </ConfigProvider>
  );
}
