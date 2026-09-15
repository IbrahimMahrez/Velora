const mongoose = require("mongoose");

const FamilySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sharedBudget: {
      amount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

FamilySchema.pre("validate", function () {
  if (!this.inviteCode) {
    this.inviteCode = generateInviteCode();
  } else {
    this.inviteCode = String(this.inviteCode).trim().toUpperCase();
  }
  // Owner is always a member
  if (this.owner) {
    const ownerId = this.owner.toString();
    const memberIds = (this.members || []).map((m) => m.toString());
    if (!memberIds.includes(ownerId)) {
      this.members = [...(this.members || []), this.owner];
    }
  }
});

module.exports =
  mongoose.models.Family || mongoose.model("Family", FamilySchema);
