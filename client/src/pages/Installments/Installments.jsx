import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "motion/react";
import {
    ArrowLeft,
    Plus,
    Search,
    CreditCard,
    Clock3,
    CheckCircle2,
    AlertTriangle,
    Pencil,
    Trash2,
    CalendarDays,
    WalletCards,
    X,
} from "lucide-react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Select,
    Spin,
    Switch,
    message,
} from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import "./Installments.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

const API_URL = "/installments";

const STATUS_OPTIONS = [
    "active",
    "completed",
    "overdue",
];

function Installments() {
    const { t, lang } = useLanguage();
    const { currency } = useCurrency();
    const locale = lang === "ar" ? "ar-EG" : "en-EG";
    const [installments, setInstallments] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInstallment, setEditingInstallment] = useState(null);

    const [form] = Form.useForm();

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
    };


    // =========================
    // FETCH INSTALLMENTS
    // =========================
    const fetchInstallments = async () => {
        try {
            setLoading(true);

            const response = await api.get(API_URL, {
                headers,
                params: {
                    page: 1,
                    limit: 100,
                },
            });

            setInstallments(response.data.installments || []);
        } catch (error) {
            console.error(error);

            message.error(
                error.response?.data?.message ||
                "Failed to load installments"
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchInstallments();
    }, []);


    // =========================
    // STATS
    // =========================
    const stats = useMemo(() => {
        return {
            total: installments.length,

            active: installments.filter(
                (item) => item.status === "active"
            ).length,

            completed: installments.filter(
                (item) => item.status === "completed"
            ).length,

            overdue: installments.filter(
                (item) => item.status === "overdue"
            ).length,

            remaining: installments.reduce(
                (sum, item) =>
                    sum + Number(item.remainingAmount || 0),
                0
            ),
        };
    }, [installments]);


    // =========================
    // FILTER
    // =========================
    const filteredInstallments = useMemo(() => {
        return installments.filter((item) => {
            const matchesSearch =
                item.productName
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchesTab =
                activeTab === "all" ||
                item.status === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [installments, search, activeTab]);


    // =========================
    // OPEN CREATE
    // =========================
    const openCreateModal = () => {
        setEditingInstallment(null);

        form.resetFields();

        form.setFieldsValue({
            downPayment: 0,
            paidMonths: 0,
            status: "active",
        });

        setIsModalOpen(true);
    };


    // =========================
    // OPEN EDIT
    // =========================
    const openEditModal = (installment) => {
        setEditingInstallment(installment);

        form.setFieldsValue({
            productName: installment.productName,
            totalPrice: installment.totalPrice,
            downPayment: installment.downPayment,
            monthlyPayment: installment.monthlyPayment,
            totalMonths: installment.totalMonths,
            paidMonths: installment.paidMonths,
            startDate: installment.startDate
                ? dayjs(installment.startDate)
                : null,
            nextPaymentDate: installment.nextPaymentDate
                ? dayjs(installment.nextPaymentDate)
                : null,
            status: installment.status,
            notes: installment.notes,
        });

        setIsModalOpen(true);
    };


    // =========================
    // CLOSE MODAL
    // =========================
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingInstallment(null);
        form.resetFields();
    };


    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (values) => {
        try {
            const payload = {
                productName: values.productName,
                totalPrice: values.totalPrice,
                downPayment: values.downPayment || 0,
                monthlyPayment: values.monthlyPayment,
                totalMonths: values.totalMonths,
                paidMonths: values.paidMonths || 0,

                startDate: values.startDate
                    ? values.startDate.toISOString()
                    : null,

                nextPaymentDate: values.nextPaymentDate
                    ? values.nextPaymentDate.toISOString()
                    : null,

                status: values.status || "active",

                notes: values.notes || "",
            };


            if (editingInstallment) {
                await api.put(
                    `${API_URL}/${editingInstallment._id}`,
                    payload,
                    { headers }
                );

                message.success(
                    "Installment updated successfully"
                );
            } else {
                await api.post(
                    API_URL,
                    payload,
                    { headers }
                );

                message.success(
                    "Installment created successfully"
                );
            }

            closeModal();
            fetchInstallments();

        } catch (error) {
            console.error(error);

            if (error.isQueued) {
                closeModal();
                message.success(
                    `${t("common.savedOffline")} — ${t("common.willSync")}`
                );
                return;
            }

            message.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Something went wrong"
            );
        }
    };


    // =========================
    // DELETE
    // =========================
    const deleteInstallment = (id) => {
        Modal.confirm({
            title: t("installments.deleteTitle"),
            content:
                t("installments.deleteConfirm"),
            okText: t("common.delete"),
            cancelText: t("common.cancel"),
            okButtonProps: {
                danger: true,
            },

            onOk: async () => {
                try {
                    await api.delete(
                        `${API_URL}/${id}`,
                        { headers }
                    );

                    message.success(
                        "Installment deleted successfully"
                    );

                    fetchInstallments();
                } catch (error) {
                    console.error(error);

                    if (error.isQueued) {
                        message.success(
                            `${t("common.savedOffline")} — ${t("common.willSync")}`
                        );
                        return;
                    }

                    message.error(
                        error.response?.data?.message ||
                        "Failed to delete installment"
                    );
                }
            },
        });
    };


    // =========================
    // MARK COMPLETED
    // =========================
    const markCompleted = async (installment) => {
        try {
            await api.put(
                `${API_URL}/${installment._id}`,
                {
                    status: "completed",
                },
                { headers }
            );

            message.success(
                "Installment marked as completed"
            );

            fetchInstallments();

        } catch (error) {
            console.error(error);

            if (error.isQueued) {
                message.success(
                    `${t("common.savedOffline")} — ${t("common.willSync")}`
                );
                return;
            }

            message.error(
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to update installment"
            );
        }
    };


    // =========================
    // FORMAT CURRENCY
    // =========================
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }).format(amount || 0);
    };


    // =========================
    // STATUS
    // =========================
    const getStatusInfo = (status) => {
        switch (status) {
            case "completed":
                return {
                    label: t("installments.completed"),
                    className: "completed",
                    icon: <CheckCircle2 size={14} />,
                };

            case "overdue":
                return {
                    label: t("installments.overdue"),
                    className: "overdue",
                    icon: <AlertTriangle size={14} />,
                };

            default:
                return {
                    label: t("installments.active"),
                    className: "active",
                    icon: <Clock3 size={14} />,
                };
        }
    };


    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div className="installments-loader">
                <Spin size="large" />
                <p>{t("installments.loading")}</p>
            </div>
        );
    }


    return (
        <div className="installments-page">

            {/* ================= HEADER ================= */}

            <motion.header
                className="installments-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >

                <div className="installments-header-info">

                    <span className="installments-eyebrow">
                        {t("installments.eyebrow")}
                    </span>

                    <h1>
                        {t("installments.title")}
                    </h1>

                    <p>
                        {t("installments.subtitle")}
                    </p>

                </div>


                <div className="installments-header-actions">

                    <LanguageToggle variant="dashboard" />

                    <Link
                        to="/dashboard"
                        className="back-dashboard-btn"
                    >
                        <ArrowLeft size={17} />
                        {t("installments.back")}
                    </Link>

                    <button
                        className="add-installment-btn"
                        onClick={openCreateModal}
                    >
                        <Plus size={18} />
                        {t("installments.addInstallment")}
                    </button>

                </div>

            </motion.header>


            {/* ================= STATS ================= */}

            <section className="installment-stats">

                <motion.div
                    className="installment-stat-card purple"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="installment-stat-icon">
                        <CreditCard size={21} />
                    </div>

                    <div>
                        <span>{t("installments.totalPlans")}</span>
                        <strong>{stats.total}</strong>
                    </div>
                </motion.div>


                <motion.div
                    className="installment-stat-card orange"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <div className="installment-stat-icon">
                        <Clock3 size={21} />
                    </div>

                    <div>
                        <span>{t("installments.active")}</span>
                        <strong>{stats.active}</strong>
                    </div>
                </motion.div>


                <motion.div
                    className="installment-stat-card green"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="installment-stat-icon">
                        <CheckCircle2 size={21} />
                    </div>

                    <div>
                        <span>{t("installments.completed")}</span>
                        <strong>{stats.completed}</strong>
                    </div>
                </motion.div>


                <motion.div
                    className="installment-stat-card red"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <div className="installment-stat-icon">
                        <AlertTriangle size={21} />
                    </div>

                    <div>
                        <span>{t("installments.overdue")}</span>
                        <strong>{stats.overdue}</strong>
                    </div>
                </motion.div>


                <motion.div
                    className="installment-stat-card balance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="installment-stat-icon">
                        <WalletCards size={21} />
                    </div>

                    <div>
                        <span>{t("installments.remainingBalance")}</span>
                        <strong>
                            {formatCurrency(stats.remaining)}
                        </strong>
                    </div>
                </motion.div>

            </section>


            {/* ================= TOOLBAR ================= */}

            <section className="installments-toolbar">

                <div className="installment-tabs">

                    {[
                        ["all", t("installments.all")],
                        ["active", t("installments.active")],
                        ["completed", t("installments.completed")],
                        ["overdue", t("installments.overdue")],
                    ].map(([value, label]) => (

                        <button
                            key={value}
                            className={
                                activeTab === value
                                    ? "installment-tab active"
                                    : "installment-tab"
                            }
                            onClick={() =>
                                setActiveTab(value)
                            }
                        >
                            {label}
                        </button>

                    ))}

                </div>


                <div className="installment-search">

                    <Search size={18} />

                    <input
                        type="text"
                        placeholder={t("installments.searchPlaceholder")}
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="clear-search"
                        >
                            <X size={15} />
                        </button>
                    )}

                </div>

            </section>


            {/* ================= LIST ================= */}

            <section className="installments-list">

                <AnimatePresence mode="popLayout">

                    {filteredInstallments.length > 0 ? (

                        filteredInstallments.map(
                            (installment, index) => {

                                const status =
                                    getStatusInfo(
                                        installment.status
                                    );

                                const total =
                                    Number(
                                        installment.totalPrice || 0
                                    );

                                const paid =
                                    Number(
                                        installment.downPayment || 0
                                    ) +
                                    Number(
                                        installment.paidMonths || 0
                                    ) *
                                    Number(
                                        installment.monthlyPayment || 0
                                    );

                                const progress =
                                    total > 0
                                        ? Math.min(
                                            (paid / total) * 100,
                                            100
                                        )
                                        : 0;

                                return (

                                    <motion.article
                                        key={installment._id}
                                        className="installment-card"
                                        layout
                                        initial={{
                                            opacity: 0,
                                            y: 20,
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
                                        }}
                                    >

                                        <div className="installment-card-left">

                                            <div className="installment-icon">
                                                <CreditCard
                                                    size={23}
                                                />
                                            </div>


                                            <div className="installment-main">

                                                <div className="installment-title-row">

                                                    <h3>
                                                        {
                                                            installment.productName
                                                        }
                                                    </h3>

                                                    <span
                                                        className={`installment-status ${status.className}`}
                                                    >
                                                        {
                                                            status.icon
                                                        }
                                                        {
                                                            status.label
                                                        }
                                                    </span>

                                                </div>


                                                <div className="installment-meta">

                                                    <span>
                                                        <CalendarDays
                                                            size={14}
                                                        />
                                                        {t("installments.nextPayment")}
                                                        {" "}
                                                        {installment.nextPaymentDate
                                                            ? dayjs(
                                                                installment.nextPaymentDate
                                                            ).format(
                                                                "DD MMM YYYY"
                                                            )
                                                            : "—"}
                                                    </span>

                                                    <span>
                                                        {t("installments.monthlyLabel")}
                                                        {" "}
                                                        <b>
                                                            {
                                                                formatCurrency(
                                                                    installment.monthlyPayment
                                                                )
                                                            }
                                                        </b>
                                                    </span>

                                                    <span>
                                                        {
                                                            installment.paidMonths || 0
                                                        }
                                                        /
                                                        {
                                                            installment.totalMonths
                                                        }
                                                        {" "}{t("installments.monthsPaid")}
                                                    </span>

                                                </div>


                                                <div className="installment-progress">

                                                    <div className="progress-header">

                                                        <span>
                                                            {t("installments.paymentProgress")}
                                                        </span>

                                                        <b>
                                                            {Math.round(
                                                                progress
                                                            )}
                                                            %
                                                        </b>

                                                    </div>

                                                    <div className="progress-track">

                                                        <div
                                                            className="progress-fill"
                                                            style={{
                                                                width: `${progress}%`,
                                                            }}
                                                        />

                                                    </div>

                                                </div>


                                                {installment.notes && (
                                                    <p className="installment-notes">
                                                        {
                                                            installment.notes
                                                        }
                                                    </p>
                                                )}

                                            </div>

                                        </div>


                                        <div className="installment-card-right">

                                            <div className="installment-amount">

                                                <span>
                                                    {t("installments.remaining")}
                                                </span>

                                                <strong>
                                                    {
                                                        formatCurrency(
                                                            installment.remainingAmount
                                                        )
                                                    }
                                                </strong>

                                                <small>
                                                    {t("installments.of")}{" "}
                                                    {
                                                        formatCurrency(
                                                            installment.totalPrice
                                                        )
                                                    }
                                                </small>

                                            </div>


                                            <div className="installment-actions">

                                                {installment.status !==
                                                    "completed" && (
                                                    <button
                                                        className="installment-pay-btn"
                                                        onClick={() =>
                                                            markCompleted(
                                                                installment
                                                            )
                                                        }
                                                        title="Mark as completed"
                                                    >
                                                        <CheckCircle2
                                                            size={17}
                                                        />
                                                    </button>
                                                )}


                                                <button
                                                    className="installment-edit-btn"
                                                    onClick={() =>
                                                        openEditModal(
                                                            installment
                                                        )
                                                    }
                                                    title={t("common.edit")}
                                                >
                                                    <Pencil
                                                        size={17}
                                                    />
                                                </button>


                                                <button
                                                    className="installment-delete-btn"
                                                    onClick={() =>
                                                        deleteInstallment(
                                                            installment._id
                                                        )
                                                    }
                                                    title={t("common.delete")}
                                                >
                                                    <Trash2
                                                        size={17}
                                                    />
                                                </button>

                                            </div>

                                        </div>

                                    </motion.article>
                                );
                            }
                        )

                    ) : (

                        <motion.div
                            className="installments-empty"
                            initial={{
                                opacity: 0,
                                scale: 0.97,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                        >
                            <div className="empty-icon">
                                <CreditCard size={30} />
                            </div>

                            <h3>
                                {t("installments.noInstallments")}
                            </h3>

                            <p>
                                {t("installments.emptyHint")}
                            </p>

                            <button
                                onClick={openCreateModal}
                                className="add-installment-btn"
                            >
                                <Plus size={17} />
                                {t("installments.addInstallment")}
                            </button>
                        </motion.div>

                    )}

                </AnimatePresence>

            </section>


            {/* ================= MODAL ================= */}

            <Modal
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                forceRender
                centered
                width={650}
                className="installment-modal"
                closeIcon={<X size={20} />}
            >

                <div className="installment-modal-header">

                    <div>
                        <span>
                            {editingInstallment
                                ? t("installments.updatePlan")
                                : t("installments.newPlan")}
                        </span>

                        <h2>
                            {editingInstallment
                                ? t("installments.editInstallment")
                                : t("installments.addInstallmentTitle")}
                        </h2>
                    </div>

                </div>


                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="installment-form"
                >

                    <Form.Item
                        name="productName"
                        label={t("installments.productLabel")}
                        rules={[
                            {
                                required: true,
                                message:
                                    t("installments.productRequired"),
                            },
                            {
                                min: 3,
                                message:
                                    t("installments.productMin"),
                            },
                        ]}
                    >
                        <Input
                            placeholder={t("installments.productPlaceholder")}
                        />
                    </Form.Item>


                    <div className="form-grid">

                        <Form.Item
                            name="totalPrice"
                            label={t("installments.totalPrice")}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        t("installments.totalRequired"),
                                },
                            ]}
                        >
                            <InputNumber
                                min={0}
                                style={{
                                    width: "100%",
                                }}
                                placeholder="0"
                            />
                        </Form.Item>


                        <Form.Item
                            name="downPayment"
                            label={t("installments.downPayment")}
                        >
                            <InputNumber
                                min={0}
                                style={{
                                    width: "100%",
                                }}
                                placeholder="0"
                            />
                        </Form.Item>

                    </div>


                    <div className="form-grid">

                        <Form.Item
                            name="monthlyPayment"
                            label={t("installments.monthlyPayment")}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        t("installments.monthlyRequired"),
                                },
                            ]}
                        >
                            <InputNumber
                                min={0}
                                style={{
                                    width: "100%",
                                }}
                                placeholder="0"
                            />
                        </Form.Item>


                        <Form.Item
                            name="totalMonths"
                            label={t("installments.totalMonths")}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        t("installments.monthsRequired"),
                                },
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{
                                    width: "100%",
                                }}
                                placeholder="12"
                            />
                        </Form.Item>

                    </div>


                    <div className="form-grid">

                        <Form.Item
                            name="paidMonths"
                            label={t("installments.paidMonths")}
                        >
                            <InputNumber
                                min={0}
                                style={{
                                    width: "100%",
                                }}
                                placeholder="0"
                            />
                        </Form.Item>


                        <Form.Item
                            name="status"
                            label={t("installments.status")}
                        >
                            <Select
                                options={STATUS_OPTIONS.map(
                                    (status) => ({
                                        value: status,
                                        label:
                                            status
                                                .charAt(0)
                                                .toUpperCase() +
                                            status.slice(1),
                                    })
                                )}
                            />
                        </Form.Item>

                    </div>


                    <div className="form-grid">

                        <Form.Item
                            name="startDate"
                            label={t("installments.startDate")}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        t("installments.startRequired"),
                                },
                            ]}
                        >
                            <DatePicker
                                style={{
                                    width: "100%",
                                }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>


                        <Form.Item
                            name="nextPaymentDate"
                            label={t("installments.nextPaymentDate")}
                            rules={[
                                {
                                    required: true,
                                    message:
                                        t("installments.nextRequired"),
                                },
                            ]}
                        >
                            <DatePicker
                                style={{
                                    width: "100%",
                                }}
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>

                    </div>


                    <Form.Item
                        name="notes"
                        label={t("installments.notes")}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder={t("installments.notesPlaceholder")}
                        />
                    </Form.Item>


                    <div className="installment-form-actions">

                        <Button
                            onClick={closeModal}
                        >
                            {t("installments.cancel")}
                        </Button>

                        <Button
                            type="primary"
                            htmlType="submit"
                        >
                            {editingInstallment
                                ? t("installments.saveChanges")
                                : t("installments.createInstallment")}
                        </Button>

                    </div>

                </Form>

            </Modal>

        </div>
    );
}

export default Installments;