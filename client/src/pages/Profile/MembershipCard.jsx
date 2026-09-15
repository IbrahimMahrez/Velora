
import {
    Sparkles,
    Users,
    ShieldCheck,
    Wifi,
    CreditCard,
} from "lucide-react";
import { motion } from "motion/react";
import "./MembershipCard.css";
import { useLanguage } from "../../context/LanguageContext";

function MembershipCard({ plan = "free", user }) {
    const { t } = useLanguage();

    const PLAN_CONFIG = {
        free: {
            name: "Free",
            label: t("membership.freeMember"),
            number: "••••  ••••  ••••  0000",
            colorClass: "membership-free",
            icon: ShieldCheck,
            description: t("membership.freeDesc"),
            limit: t("membership.basicAccess"),
        },

        premium: {
            name: "Premium",
            label: t("membership.premiumMember"),
            number: "••••  ••••  ••••  8888",
            colorClass: "membership-premium",
            icon: Sparkles,
            description: t("membership.premiumDesc"),
            limit: t("membership.unlimitedAccess"),
        },

        family: {
            name: "Family",
            label: t("membership.familyPlan"),
            number: "••••  ••••  ••••  4444",
            colorClass: "membership-family",
            icon: Users,
            description: t("membership.familyDesc"),
            limit: t("membership.upToMembers"),
        },
    };
    const safePlan =
        typeof plan === "string"
            ? plan.toLowerCase()
            : "free";

    const normalizedPlan = safePlan.includes("premium")
        ? "premium"
        : safePlan.includes("family")
        ? "family"
        : "free";

    const config = PLAN_CONFIG[normalizedPlan];
    const PlanIcon = config.icon;

    const userName =
        user?.name ||
        user?.email?.split("@")[0] ||
        "Velora Member";

    return (
        <motion.div
            className={`membership-card ${config.colorClass}`}
            initial={{
                opacity: 0,
                y: 24,
                scale: 0.98,
            }}
            animate={{
                opacity: 1,
                y: 0,
                scale: 1,
            }}
            transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
            }}
        >
            {/* Animated glow */}
            <div className="membership-glow" />

            {/* Subtle noise */}
            <div className="membership-noise" />

            {/* Content */}
            <div className="membership-card-content">

                {/* Top */}
                <div className="membership-card-top">
                    <div className="membership-brand">
                        <div className="membership-brand-icon">
                            <Sparkles size={14} />
                        </div>

                        <span>Velora</span>
                    </div>

                    <div className="membership-type">
                        <PlanIcon size={14} />
                        <span>{config.label}</span>
                    </div>
                </div>

                {/* Chip */}
                <div className="membership-chip-row">
                    <div className="membership-chip">
                        <span />
                        <span />
                        <span />
                    </div>

                    <Wifi
                        className="membership-contactless"
                        size={21}
                    />
                </div>

                {/* Card number */}
                <div className="membership-number">
                    {config.number}
                </div>

                {/* Bottom information */}
                <div className="membership-card-bottom">

                    <div className="membership-holder">
                        <span>{t("membership.member")}</span>

                        <strong title={userName}>
                            {userName}
                        </strong>
                    </div>

                    <div className="membership-plan">
                        <span>{t("membership.plan")}</span>

                        <strong>
                            {config.name}
                        </strong>
                    </div>

                </div>

                {/* Footer */}
                <div className="membership-card-footer">

                    <div className="membership-footer-description">
                        <CreditCard size={12} />

                        <span>
                            {config.description}
                        </span>
                    </div>

                    <strong>
                        {config.limit}
                    </strong>

                </div>
            </div>
        </motion.div>
    );
}

export default MembershipCard;
