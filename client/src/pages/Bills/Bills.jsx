
import { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

import {
  Plus,
  ArrowLeft,
  Search,
  Receipt,
  Zap,
  Droplets,
  Wifi,
  Flame,
  Smartphone,
  Home,
  MoreHorizontal,
  CalendarDays,
  Bell,
  BellOff,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Pencil,
  Trash2,
  CreditCard,
  X,
  Upload,
  FileImage,
  Download,
  ScanLine,
} from "lucide-react";
import { downloadCsv, datedFilename } from "../../utils/exportCsv";

import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  message,
} from "antd";

import dayjs from "dayjs";
import "./Bills.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/bills";

const categories = [
  "Electricity",
  "Water",
  "Internet",
  "Gas",
  "Mobile",
  "Rent",
  "Other",
];

const billingCycles = [
  "monthly",
  "weekly",
  "yearly",
];

const categoryIcons = {
  Electricity: Zap,
  Water: Droplets,
  Internet: Wifi,
  Gas: Flame,
  Mobile: Smartphone,
  Rent: Home,
  Other: MoreHorizontal,
};

function Bills() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { currency } = useCurrency();
  const locale = lang === "ar" ? "ar-EG" : "en-EG";

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanMsg, setScanMsg] = useState(null);
  const [preview, setPreview] = useState(null);

  // Direct file handle — the scan/upload logic reads this ref
  // instead of relying on antd form state, so selecting an
  // image always works even if the form store lags behind.
  const fileRef = useRef(null);

  const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

  const clearPreviewUrl = () => {
    setPreview((prev) => {
      if (prev?.url) {
        try {
          URL.revokeObjectURL(prev.url);
        } catch {
          // ignore
        }
      }
      return null;
    });
  };

  const handleImageSelect = (file) => {
    if (!file) return;

    const isImage =
      file.type?.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name || "");

    if (!isImage) {
      setScanMsg({ type: "error", text: t("bills.imageInvalid") });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setScanMsg({ type: "error", text: t("bills.imageTooBig") });
      return;
    }

    setScanMsg(null);
    clearPreviewUrl();

    fileRef.current = file;

    const readable = (file.type || "").startsWith("image/") &&
      !/heic|heif/i.test(file.type || "") &&
      !/\.(heic|heif)$/i.test(file.name || "");

    setPreview({
      name: file.name,
      size: file.size,
      url: readable ? URL.createObjectURL(file) : null,
    });

    form.setFieldsValue({
      billImage: {
        fileList: [
          {
            originFileObj: file,
            name: file.name,
          },
        ],
      },
    });
  };

  const handleRemoveImage = () => {
    clearPreviewUrl();
    setScanMsg(null);
    fileRef.current = null;
    form.setFieldsValue({ billImage: undefined });
  };

  const [form] = Form.useForm();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // =========================
  // GET BILLS
  // =========================

  const fetchBills = async () => {
    try {
      setLoading(true);

      const response = await api.get(API_URL, {
        headers,
        params: {
          page: 1,
          limit: 100,
        },
      });

      setBills(response.data.bills || []);
    } catch (error) {
      console.error(error);

      message.error(
        error.response?.data?.message ||
          "Failed to load bills"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // =========================
  // FILTER
  // =========================

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesTab =
        activeTab === "all" ||
        bill.status === activeTab;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        bill.title
          ?.toLowerCase()
          .includes(searchValue) ||
        bill.category
          ?.toLowerCase()
          .includes(searchValue);

      return matchesTab && matchesSearch;
    });
  }, [bills, activeTab, search]);

  // =========================
  // STATS
  // =========================

  const totalBills = bills.reduce(
    (sum, bill) =>
      sum + Number(bill.amount || 0),
    0
  );

  const pendingBills = bills
    .filter((bill) => bill.status === "pending")
    .reduce(
      (sum, bill) =>
        sum + Number(bill.amount || 0),
      0
    );

  const overdueBills = bills
    .filter((bill) => bill.status === "overdue")
    .reduce(
      (sum, bill) =>
        sum + Number(bill.amount || 0),
      0
    );

  // =========================
  // OPEN CREATE
  // =========================

  const openCreateModal = () => {
    setEditingBill(null);
    clearPreviewUrl();
    setScanMsg(null);
    fileRef.current = null;

    form.resetFields();

    form.setFieldsValue({
      category: "Other",
      billingCycle: "monthly",
      status: "pending",
      reminderEnabled: true,
    });

    setIsModalOpen(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const openEditModal = (bill) => {
    setEditingBill(bill);
    clearPreviewUrl();
    setScanMsg(null);
    fileRef.current = null;

    form.setFieldsValue({
      title: bill.title,
      amount: bill.amount,
      category: bill.category,
      billingCycle: bill.billingCycle,
      status: bill.status,
      dueDate: bill.dueDate
        ? dayjs(bill.dueDate)
        : null,
      reminderEnabled: bill.reminderEnabled,
      notes: bill.notes || "",
      billImage: undefined,
    });

    setIsModalOpen(true);
  };

  // =========================
  // AI RECEIPT SCAN
  // Reads the selected bill image and pre-fills
  // title / amount / due date. Never blocks submit.
  // =========================

  const handleScanReceipt = async () => {
    // Prefer the direct handle; fall back to antd form state.
    const fromForm =
      form.getFieldValue("billImage")?.fileList ||
      form.getFieldValue("billImage") ||
      [];

    const fromFormFile = Array.isArray(fromForm)
      ? fromForm[0]?.originFileObj || fromForm[0]
      : fromForm?.originFileObj;

    const file = fileRef.current || fromFormFile;

    if (!file) {
      setScanMsg({ type: "error", text: t("bills.scanNoFile") });
      return;
    }

    try {
      setScanning(true);
      setScanMsg(null);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post(
        "/ai/scan-receipt",
        formData
      );

      const receipt = response.data?.receipt;

      if (!receipt) {
        setScanMsg({ type: "error", text: t("bills.scanFailed") });
        return;
      }

      const patch = {};

      if (receipt.title) {
        patch.title = receipt.title;
      }

      if (
        receipt.amount !== null &&
        receipt.amount !== undefined &&
        Number.isFinite(Number(receipt.amount))
      ) {
        patch.amount = Number(receipt.amount);
      }

      if (receipt.date) {
        const parsed = dayjs(receipt.date);
        if (parsed.isValid()) {
          patch.dueDate = parsed;
        }
      }

      if (Object.keys(patch).length > 0) {
        form.setFieldsValue(patch);
        setScanMsg({ type: "success", text: t("bills.scanDone") });
      } else {
        setScanMsg({ type: "error", text: t("bills.scanFailed") });
      }
    } catch (err) {
      console.error(
        "Receipt scan failed:",
        err.response?.data || err.message
      );
      setScanMsg({ type: "error", text: t("bills.scanFailed") });
    } finally {
      setScanning(false);
    }
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (values) => {
    try {
      // Upload image if selected (direct handle first,
      // antd form state as fallback)
      const submitFileList =
        values.billImage?.fileList ||
        values.billImage ||
        [];

      const submitFile =
        fileRef.current ||
        (Array.isArray(submitFileList)
          ? submitFileList[0]?.originFileObj ||
            submitFileList[0]
          : submitFileList?.originFileObj);

      const hasImage = submitFile instanceof File;

      // JSON when there is no image (queueable offline),
      // multipart only when an image is attached.
      let payload;
      let extraHeaders;

      if (hasImage) {
        const formData = new FormData();

        formData.append("title", values.title);
        formData.append("amount", values.amount);
        formData.append("category", values.category);
        formData.append("billingCycle", values.billingCycle);
        formData.append("status", values.status);

        formData.append(
          "dueDate",
          values.dueDate.format("YYYY-MM-DD")
        );

        formData.append(
          "reminderEnabled",
          values.reminderEnabled ? "true" : "false"
        );

        formData.append("notes", values.notes || "");
        formData.append("billImage", submitFile);

        payload = formData;
        extraHeaders = {
          ...headers,
          "Content-Type": "multipart/form-data",
        };
      } else {
        payload = {
          title: values.title,
          amount: values.amount,
          category: values.category,
          billingCycle: values.billingCycle,
          status: values.status,
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          reminderEnabled: Boolean(values.reminderEnabled),
          notes: values.notes || "",
        };
        extraHeaders = { ...headers };
      }

      // UPDATE
      if (editingBill) {
        await api.put(
          `${API_URL}/${editingBill._id}`,
          payload,
          {
            headers: extraHeaders,
          }
        );

        message.success(
          "Bill updated successfully"
        );
      }

      // CREATE
      else {
        await api.post(
          API_URL,
          payload,
          {
            headers: extraHeaders,
          }
        );

        message.success(
          "Bill created successfully"
        );
      }

      setIsModalOpen(false);
      setEditingBill(null);
      form.resetFields();

      await fetchBills();
    } catch (error) {
      console.error(error);

      // Offline: queued for later sync — report success.
      if (error.isQueued) {
        setIsModalOpen(false);
        setEditingBill(null);
        form.resetFields();

        message.success(
          `${t("common.savedOffline")} — ${t("common.willSync")}`
        );

        return;
      }

      // Offline with an image attached (can't be queued).
      if (!error.response) {
        message.error(t("common.needsConnection"));
        return;
      }

      message.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteBill = async (id) => {
    try {
      await api.delete(
        `${API_URL}/${id}`,
        {
          headers,
        }
      );

      message.success(
        "Bill deleted successfully"
      );

      setBills((prev) =>
        prev.filter(
          (bill) => bill._id !== id
        )
      );
    } catch (error) {
      console.error(error);

      message.error(
        error.response?.data?.message ||
          "Failed to delete bill"
      );
    }
  };

  // =========================
  // MARK AS PAID
  // =========================

  const markAsPaid = async (bill) => {
    try {
      /*
       * We send the complete bill data because
       * the backend update validation may require
       * title, amount and dueDate.
       */

      const formData = new FormData();

      formData.append("title", bill.title);
      formData.append("amount", bill.amount);
      formData.append(
        "category",
        bill.category
      );
      formData.append(
        "billingCycle",
        bill.billingCycle
      );
      formData.append("status", "paid");

      formData.append(
        "dueDate",
        dayjs(bill.dueDate).format(
          "YYYY-MM-DD"
        )
      );

      formData.append(
        "reminderEnabled",
        bill.reminderEnabled
          ? "true"
          : "false"
      );

      formData.append(
        "notes",
        bill.notes || ""
      );

      await api.put(
        `${API_URL}/${bill._id}`,
        formData,
        {
          headers: {
            ...headers,
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      message.success(
        "Bill marked as paid"
      );

      await fetchBills();
    } catch (error) {
      console.error(error);

      message.error(
        error.response?.data?.message ||
          "Failed to update bill"
      );
    }
  };

  // =========================
  // MONEY
  // =========================

  const formatMoney = (amount) => {
    return new Intl.NumberFormat(
      locale,
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(amount);
  };

  // =========================
  // STATUS ICON
  // =========================

  const getStatusIcon = (status) => {
    if (status === "paid") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "overdue") {
      return <AlertCircle size={15} />;
    }

    return <Clock3 size={15} />;
  };

  // =========================
  // STATUS LABEL
  // =========================

  const getStatusLabel = (status) => {
    if (status === "paid") {
      return t("bills.paid");
    }

    if (status === "overdue") {
      return t("bills.overdue");
    }

    return t("bills.pending");
  };

  // =========================
  // DATE
  // =========================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      locale,
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBill(null);
    setScanMsg(null);
    clearPreviewUrl();
    fileRef.current = null;
    form.resetFields();
  };

  return (
    <div className="bills-page">

      {/* =========================
          HEADER
      ========================= */}

      <motion.div
        className="bills-header"
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.7,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
      >

        {/* HEADER CONTENT */}

        <div className="bills-header-content">

          <div className="bills-eyebrow">
            {t("bills.eyebrow")}
          </div>

          <h1>
            {t("bills.title")}
            <span>.</span>
          </h1>

          <p>
            {t("bills.subtitle")}
          </p>

        </div>

        {/* HEADER ACTIONS
            BOTH BUTTONS ARE IN THE SAME CONTAINER
        */}

        <div className="bills-header-actions">

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <LanguageToggle variant="dashboard" />
          </div>

          <motion.button
            type="button"
            className="back-dashboard-btn"
            onClick={() =>
              navigate("/dashboard")
            }
            whileHover={{
              y: -3,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            <ArrowLeft size={18} />

            <span>
              {t("bills.back")}
            </span>
          </motion.button>

          <motion.button
            type="button"
            className="back-dashboard-btn"
            onClick={() => {
              const rows = filteredBills.map((b) => ({
                title: b.title || "",
                amount: b.amount ?? "",
                status: b.status || "",
                dueDate: b.dueDate
                  ? new Date(b.dueDate).toISOString().split("T")[0]
                  : "",
                category: b.category || "",
              }));
              downloadCsv(datedFilename("bills"), rows);
            }}
          >
            <Download size={18} />
            <span>{t("common.exportCsv")}</span>
          </motion.button>

          <motion.button
            type="button"
            className="add-bill-btn"
            onClick={openCreateModal}
            whileHover={{
              y: -3,
              scale: 1.02,
            }}
            whileTap={{
              scale: 0.97,
            }}
          >
            <Plus size={19} />

            <span>
              {t("bills.addBill")}
            </span>
          </motion.button>

        </div>

      </motion.div>

      {/* =========================
          STATS
      ========================= */}

      <div className="bill-stats">

        <motion.div
          className="bill-stat-motion"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          whileHover={{
            y: -5,
          }}
        >
          <div className="bill-stat-card bill-stat-purple">

            <div className="bill-stat-icon">
              <Receipt size={25} />
            </div>

            <div className="bill-stat-content">
              <span>
                {t("bills.totalBills")}
              </span>

              <strong>
                {formatMoney(totalBills)}
              </strong>
            </div>

          </div>
        </motion.div>

        <motion.div
          className="bill-stat-motion"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.2,
          }}
          whileHover={{
            y: -5,
          }}
        >
          <div className="bill-stat-card bill-stat-orange">

            <div className="bill-stat-icon">
              <Clock3 size={25} />
            </div>

            <div className="bill-stat-content">
              <span>
                {t("bills.pending")}
              </span>

              <strong>
                {formatMoney(pendingBills)}
              </strong>
            </div>

          </div>
        </motion.div>

        <motion.div
          className="bill-stat-motion"
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.3,
          }}
          whileHover={{
            y: -5,
          }}
        >
          <div className="bill-stat-card bill-stat-red">

            <div className="bill-stat-icon">
              <AlertCircle size={25} />
            </div>

            <div className="bill-stat-content">
              <span>
                {t("bills.overdue")}
              </span>

              <strong>
                {formatMoney(overdueBills)}
              </strong>
            </div>

          </div>
        </motion.div>

      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <motion.div
        className="bills-toolbar"
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.35,
        }}
      >

        <div className="bill-tabs">

          {[
            ["all", t("bills.all")],
            ["pending", t("bills.pending")],
            ["paid", t("bills.paid")],
            ["overdue", t("bills.overdue")],
          ].map(
            ([value, label]) => (
              <button
                type="button"
                key={value}
                className={
                  activeTab === value
                    ? "bill-tab active"
                    : "bill-tab"
                }
                onClick={() =>
                  setActiveTab(value)
                }
              >
                {label}

                <span>
                  {value === "all"
                    ? bills.length
                    : bills.filter(
                        (bill) =>
                          bill.status ===
                          value
                      ).length}
                </span>
              </button>
            )
          )}

        </div>

        <div className="bill-search">

          <Search size={18} />

          <input
            type="text"
            placeholder={t("bills.searchPlaceholder")}
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
            >
              <X size={16} />
            </button>
          )}

        </div>

      </motion.div>

      {/* =========================
          LIST
      ========================= */}

      <div className="bills-list">

        {loading ? (

          <div className="bills-empty">

            <div className="bill-loader"></div>

            <p>
              {t("bills.loading")}
            </p>

          </div>

        ) : filteredBills.length === 0 ? (

          <motion.div
            className="bills-empty"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
          >

            <div className="empty-bill-icon">
              <Receipt size={32} />
            </div>

            <h3>
              {t("bills.noBills")}
            </h3>

            <p>
              {search
                ? t("bills.searchHint")
                : t("bills.emptyHint")}
            </p>

            {!search && (
              <button
                type="button"
                className="empty-add-btn"
                onClick={
                  openCreateModal
                }
              >
                <Plus size={17} />
                {t("bills.addFirstBill")}
              </button>
            )}

          </motion.div>

        ) : (

          <AnimatePresence mode="popLayout">

            {filteredBills.map(
              (bill, index) => {

                const Icon =
                  categoryIcons[
                    bill.category
                  ] ||
                  MoreHorizontal;

                return (
                  <motion.div
                    className="bill-card"
                    key={bill._id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 30,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.96,
                    }}
                    transition={{
                      delay:
                        index * 0.04,
                      duration: 0.55,
                      ease: [
                        0.16,
                        1,
                        0.3,
                        1,
                      ],
                    }}
                    whileHover={{
                      y: -4,
                    }}
                  >

                    {/* LEFT */}

                    <div className="bill-card-left">

                      <div className="bill-category-icon">
                        <Icon size={22} />
                      </div>

                      <div className="bill-main-info">

                        <div className="bill-title-row">

                          <h3>
                            {bill.title}
                          </h3>

                          <span
                            className={`bill-status bill-status-${bill.status}`}
                          >
                            {getStatusIcon(
                              bill.status
                            )}

                            {getStatusLabel(
                              bill.status
                            )}
                          </span>

                        </div>

                        <div className="bill-meta">

                          <span>
                            <CalendarDays
                              size={15}
                            />

                            {t("bills.due")}{" "}
                            {formatDate(
                              bill.dueDate
                            )}
                          </span>

                          <span className="bill-cycle">
                            {bill.billingCycle === "monthly"
                              ? t("bills.monthly")
                              : bill.billingCycle === "weekly"
                              ? t("bills.weekly")
                              : bill.billingCycle === "yearly"
                              ? t("bills.yearly")
                              : bill.billingCycle}
                          </span>

                          {bill.reminderEnabled ? (
                            <span>
                              <Bell size={14} />
                              {t("bills.reminderOn")}
                            </span>
                          ) : (
                            <span>
                              <BellOff
                                size={14}
                              />
                              {t("bills.reminderOff")}
                            </span>
                          )}

                        </div>

                        {bill.notes && (
                          <p className="bill-notes">
                            {bill.notes}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* RIGHT */}

                    <div className="bill-card-right">

                      <div className="bill-amount">
                        {formatMoney(
                          bill.amount
                        )}
                      </div>

                      <div className="bill-actions">

                        {bill.status !==
                          "paid" && (
                          <button
                            type="button"
                            className="bill-action pay"
                            onClick={() =>
                              markAsPaid(
                                bill
                              )
                            }
                            title="Mark as paid"
                          >
                            <CreditCard
                              size={16}
                            />

                            <span>
                              {t("bills.pay")}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          className="bill-action edit"
                          onClick={() =>
                            openEditModal(
                              bill
                            )
                          }
                          title={t("common.edit")}
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          type="button"
                          className="bill-action delete"
                          onClick={() =>
                            deleteBill(
                              bill._id
                            )
                          }
                          title={t("common.delete")}
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                  </motion.div>
                );
              }
            )}

          </AnimatePresence>
        )}

      </div>

      {/* =========================
          MODAL
      ========================= */}

      <Modal
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        centered
        forceRender
        className="bill-modal"
        closeIcon={<X size={20} />}
      >

        <div className="bill-modal-header">

          <div className="modal-icon">
            {editingBill ? (
              <Pencil size={22} />
            ) : (
              <Receipt size={22} />
            )}
          </div>

          <div>

            <h2>
              {editingBill
                ? t("bills.editBill")
                : t("bills.addNewBill")}
            </h2>

            <p>
              {editingBill
                ? t("bills.editDesc")
                : t("bills.addDesc")}
            </p>

          </div>

        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="bill-form"
        >

          {/* TITLE + AMOUNT */}

          <Row gutter={14}>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.billTitle")}
                name="title"
                rules={[
                  {
                    required: true,
                    message:
                      t("bills.titleRequired"),
                  },
                ]}
              >
                <Input
                  placeholder={t("bills.billTitlePlaceholder")}
                  prefix={
                    <Receipt size={16} />
                  }
                />
              </Form.Item>

            </Col>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.amount")}
                name="amount"
                rules={[
                  {
                    required: true,
                    message:
                      t("bills.amountRequired"),
                  },
                ]}
              >
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  placeholder="1250"
                  min={0}
                  prefix={currency}
                />
              </Form.Item>

            </Col>

          </Row>

          {/* CATEGORY + BILLING CYCLE */}

          <Row gutter={14}>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.category")}
                name="category"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select>
                  {categories.map(
                    (category) => (
                      <Select.Option
                        key={category}
                        value={category}
                      >
                        {category}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>

            </Col>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.billingCycle")}
                name="billingCycle"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Select>
                  {billingCycles.map(
                    (cycle) => (
                      <Select.Option
                        key={cycle}
                        value={cycle}
                      >
                        {cycle
                          .charAt(0)
                          .toUpperCase() +
                          cycle.slice(1)}
                      </Select.Option>
                    )
                  )}
                </Select>
              </Form.Item>

            </Col>

          </Row>

          {/* DATE + STATUS */}

          <Row gutter={14}>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.dueDate")}
                name="dueDate"
                rules={[
                  {
                    required: true,
                    message:
                      t("bills.dateRequired"),
                  },
                ]}
              >
                <DatePicker
                  style={{
                    width: "100%",
                  }}
                  format="DD MMM YYYY"
                />
              </Form.Item>

            </Col>

            <Col xs={24} sm={12}>

              <Form.Item
                label={t("bills.status")}
                name="status"
              >
                <Select>

                  <Select.Option value="pending">
                    {t("bills.pending")}
                  </Select.Option>

                  <Select.Option value="paid">
                    {t("bills.paid")}
                  </Select.Option>

                  <Select.Option value="overdue">
                    {t("bills.overdue")}
                  </Select.Option>

                </Select>
              </Form.Item>

            </Col>

          </Row>

          {/* NOTES */}

          <Form.Item
            label={t("bills.notes")}
            name="notes"
          >
            <Input.TextArea
              rows={3}
              placeholder={t("bills.notesPlaceholder")}
            />
          </Form.Item>

          {/* IMAGE */}

          <Form.Item
            label={t("bills.billImage")}
            name="billImage"
            valuePropName="file"
            getValueFromEvent={(e) =>
              Array.isArray(e)
                ? e
                : e?.fileList
            }
          >

            <label className="bill-upload">

              <Upload size={20} />

              <span>
                {t("bills.uploadImage")}
              </span>

              <input
                type="file"
                accept="image/*,.heic,.heif"
                hidden
                onChange={(e) => {
                  handleImageSelect(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />

              <FileImage size={16} />

            </label>

          </Form.Item>

          {preview && (
            <div
              className="bill-preview clickable"
              onClick={handleRemoveImage}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleRemoveImage();
                }
              }}
              role="button"
              tabIndex={0}
              title={t("common.delete")}
            >
              {preview.url ? (
                <img src={preview.url} alt={preview.name} />
              ) : (
                <span className="bill-preview-icon">
                  <FileImage size={20} />
                </span>
              )}
              <div className="bill-preview-info">
                <strong>{preview.name}</strong>
                <span>
                  {(preview.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <button
                type="button"
                className="bill-preview-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                title={t("common.delete")}
              >
                <X size={14} />
              </button>
              <span className="bill-preview-hover">
                <Trash2 size={18} />
              </span>
            </div>
          )}

          <button
            type="button"
            className="bill-scan-btn"
            onClick={handleScanReceipt}
            disabled={scanning}
          >
            <ScanLine size={15} />
            {scanning
              ? t("bills.scanning")
              : t("bills.scanReceipt")}
          </button>

          {scanMsg && (
            <p className={`bill-scan-msg ${scanMsg.type}`}>
              {scanMsg.text}
            </p>
          )}

          {/* REMINDER */}

          <Form.Item
            label={t("bills.reminder")}
            name="reminderEnabled"
            valuePropName="checked"
          >

            <div className="reminder-switch">

              <div>

                <Bell size={17} />

                <span>
                  {t("bills.reminderEnable")}
                </span>

              </div>

              <Switch />

            </div>

          </Form.Item>

          {/* ACTIONS */}

          <div className="bill-form-actions">

            <button
              type="button"
              className="cancel-bill-btn"
              onClick={closeModal}
            >
              {t("bills.cancel")}
            </button>

            <button
              type="submit"
              className="save-bill-btn"
            >

              <CheckCircle2
                size={17}
              />

              {editingBill
                ? t("bills.saveChanges")
                : t("bills.createBill")}

            </button>

          </div>

        </Form>

      </Modal>

    </div>
  );
}

export default Bills;
