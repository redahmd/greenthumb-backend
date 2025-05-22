// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: {
    type: String,
    required: function () {
      return this.provider === 'local';
    },
  },
  provider: { type: String, default: "local" },
  providerId: { type: String, default: null },
  emailVerified: { type: Boolean, default: false },
  verificationCode: String,
  codeExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpiresAt: Date,
}, { timestamps: true });

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.model("User", userSchema);
