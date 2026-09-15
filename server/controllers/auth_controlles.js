const Joi = require("joi");
const asyncHandler = require("express-async-handler");
const {
  validateRegisterUser,
  validateLoginUser,
} = require("../validations/uservalidations");
const User = require("../models/User");
const VerificationCode = require("../models/VerificationCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../utils/generatetoken");
const nodemailer = require("nodemailer");
const sendEmail = require("../services/emailService");

// ======================================================
// EMAIL VERIFICATION HELPERS
// ======================================================

const createAndSendVerificationCode = async (user) => {
  await VerificationCode.deleteMany({ user: user._id });

  const code = String(Math.floor(100000 + Math.random() * 900000));

  await VerificationCode.create({
    user: user._id,
    email: user.email,
    code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const html = `
    <div style="margin:0;padding:40px 20px;background:#050505;font-family:Arial,sans-serif;color:#ffffff;">
      <div style="max-width:600px;margin:auto;padding:35px;background:#111111;border:1px solid #292929;border-radius:16px;text-align:center;">
        <h1 style="margin-bottom:10px;color:#ffffff;letter-spacing:4px;">VELORA</h1>
        <p style="color:#8b82ff;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Email Verification</p>
        <h2 style="margin-top:30px;">Your verification code</h2>
        <div style="margin:24px 0;padding:20px;background:#1a1a1a;border-radius:12px;font-size:36px;font-weight:bold;letter-spacing:8px;color:#ffffff;">${code}</div>
        <p style="color:#bdbdbd;line-height:1.7;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #292929;color:#666666;font-size:12px;">© Velora — Your Financial Workspace</div>
      </div>
    </div>
  `;

  await sendEmail(user.email, "Velora verification code", html);

  return code;
};

// ======================================================
// REGISTER USER
// ======================================================

const registerUser = asyncHandler(async (req, res) => {
  const { error } = validateRegisterUser(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  let user = await User.findOne({
    email: req.body.email,
  });

  if (user) {
    return res.status(400).json({
      success: false,
      message: "User already exists",
    });
  }

  const salt = await bcrypt.genSalt(10);

  const hashedPassword = await bcrypt.hash(
    req.body.password,
    salt
  );

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  const token = generateToken(user);

  // Best-effort verification email — never fail registration
  try {
    await createAndSendVerificationCode(user);
  } catch (err) {
    console.error("Verification email failed:", err.message);
  }

  res.status(200).json({
    success: true,
    message: "User registered successfully",
    token,
    requiresVerification: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isVerified: false,
      createdAt: user.createdAt,
    },
  });
});

// ======================================================
// LOGIN USER
// ======================================================

const loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLoginUser(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const isMatch = await bcrypt.compare(
    req.body.password,
    user.password
  );

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken(user);

  // Grandfather existing accounts created before verification launch
  if (
    !user.isVerified &&
    user.createdAt &&
    new Date(user.createdAt) < new Date("2026-09-14T00:00:00Z")
  ) {
    user.isVerified = true;
    await user.save();
  }

  // Unverified users still get a token (needed to open the
  // verification page and resend the code). ProtectedRoute on
  // the frontend fences them to /verify-email until verified,
  // so this never grants access to app content. A token-less
  // 403 here used to cause a login <-> verify-email loop.
  if (!user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Please verify your email",
      token,
      requiresVerification: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  }

  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
});

// ======================================================
// LOGOUT USER
// ======================================================

const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

// ======================================================
// FORGOT PASSWORD
// POST /auth/forgetpassword
// ======================================================

const sendForgetpassLink = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const email = req.body.email.trim().toLowerCase();

  const user = await User.findOne({
    email,
  });

  /*
    Security:
    We don't reveal whether the email exists.
    The frontend receives the same response either way.
  */

  if (!user) {
    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  }

  // ====================================================
  // CREATE RESET TOKEN
  // ====================================================

  const secret = process.env.JWT_SECRET + user.password;

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    secret,
    {
      expiresIn: "10m",
    }
  );

  // ====================================================
  // RESET LINK
  // ====================================================

  const frontendURL =
    process.env.FRONTEND_URL || "http://localhost:5173";

  const link = `${frontendURL}/reset-password/${user._id}/${token}`;

  // ====================================================
  // MAIL TRANSPORTER
  // ====================================================

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_APP,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // ====================================================
  // EMAIL
  // ====================================================

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: user.email,
    subject: "Reset Your Velora Password",
    html: `
      <div
        style="
          margin: 0;
          padding: 40px 20px;
          background: #050505;
          font-family: Arial, sans-serif;
          color: #ffffff;
        "
      >
        <div
          style="
            max-width: 600px;
            margin: auto;
            padding: 35px;
            background: #111111;
            border: 1px solid #292929;
            border-radius: 16px;
          "
        >
          <h1
            style="
              margin-bottom: 10px;
              color: #ffffff;
              letter-spacing: 4px;
            "
          >
            VELORA
          </h1>

          <p
            style="
              color: #8b82ff;
              font-size: 12px;
              letter-spacing: 2px;
              text-transform: uppercase;
            "
          >
            Account Security
          </p>

          <h2 style="margin-top: 30px;">
            Reset your password
          </h2>

          <p
            style="
              color: #bdbdbd;
              line-height: 1.7;
            "
          >
            We received a request to reset your Velora account
            password.
          </p>

          <p
            style="
              color: #bdbdbd;
              line-height: 1.7;
            "
          >
            Click the button below to create a new password.
            This link will expire in 10 minutes.
          </p>

          <div style="margin: 30px 0;">
            <a
              href="${link}"
              style="
                display: inline-block;
                padding: 14px 24px;
                background: #7d5cff;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                letter-spacing: 1px;
              "
            >
              RESET PASSWORD
            </a>
          </div>

          <p
            style="
              color: #777777;
              font-size: 12px;
              line-height: 1.6;
            "
          >
            If you didn't request a password reset, you can
            safely ignore this email.
          </p>

          <div
            style="
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #292929;
              color: #666666;
              font-size: 12px;
            "
          >
            © Velora — Your Financial Workspace
          </div>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log("Password reset email sent:", info.messageId);

    return res.status(200).json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    console.error(
      "Password reset email error:",
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email",
    });
  }
});

// ======================================================
// RESET PASSWORD
// POST /auth/reset-password/:userId/:token
// ======================================================

const resetPassword = asyncHandler(async (req, res) => {
  const schema = Joi.object({
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
      }),
  });

  const { error } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { userId, token } = req.params;

  // ====================================================
  // FIND USER
  // ====================================================

  const user = await User.findById(userId);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }

  // ====================================================
  // VERIFY TOKEN
  // ====================================================

  const secret = process.env.JWT_SECRET + user.password;

  try {
    const decoded = jwt.verify(token, secret);

    // Make sure token belongs to this user
    if (decoded.id !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // ==================================================
    // HASH NEW PASSWORD
    // ==================================================

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      req.body.password,
      salt
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset link",
    });
  }
});

// ======================================================
// OLD EJS FORGET PASSWORD VIEW
// ======================================================

const getForgetPasswordview = asyncHandler(async (req, res) => {
  res.render("forgetpassword");
});

// ======================================================
// OLD EJS RESET PASSWORD VIEW
// ======================================================

const getResetPasswordView = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const secret = process.env.JWT_SECRET + user.password;

  try {
    jwt.verify(req.params.token, secret);

    res.render("reset-password", {
      email: user.email,
      userId: user._id,
      token: req.params.token,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
});

// ======================================================
// SEND VERIFICATION CODE
// POST /auth/send-verification
// ======================================================

const sendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
    });
  }

  try {
    await createAndSendVerificationCode(user);
  } catch (err) {
    console.error("Verification email failed:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Verification code sent to your email",
  });
});

// ======================================================
// VERIFY EMAIL
// POST /auth/verify-email
// ======================================================

const verifyEmail = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Verification code is required",
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (user.isVerified) {
    return res.status(200).json({
      success: true,
      message: "Email already verified",
    });
  }

  const record = await VerificationCode.findOne({
    user: user._id,
  }).sort({ createdAt: -1 });

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "No verification code found. Please request a new one.",
    });
  }

  if (record.expiresAt && record.expiresAt < new Date()) {
    await VerificationCode.deleteMany({ user: user._id });
    return res.status(400).json({
      success: false,
      message: "Verification code expired. Please request a new one.",
    });
  }

  if (record.code !== String(code).trim()) {
    record.attempts = (record.attempts || 0) + 1;
    await record.save();

    if (record.attempts >= 5) {
      await VerificationCode.deleteMany({ user: user._id });
      return res.status(400).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new code.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid verification code",
    });
  }

  user.isVerified = true;
  await user.save();
  await VerificationCode.deleteMany({ user: user._id });

  return res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getForgetPasswordview,
  sendForgetpassLink,
  resetPassword,
  getResetPasswordView,
  sendVerification,
  verifyEmail,
};