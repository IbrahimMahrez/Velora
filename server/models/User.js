const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
      unique: true,
      lowercase: true,
    },
phone: {
    type: String,
    default: "",
    trim: true,
},
    password: {
      type: String,
      required: true,
      minlength: 5,
      trim: true,
    },

    avatar: {
      type: String,
      default: "",
      trim: true,
    },

    plan: {
      type: String,
      default: "free",
      trim: true,
    },

    occupation: {
      type: String,
      default: "",
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);