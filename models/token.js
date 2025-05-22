import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    codeHash: { type: String, required: true },
    type: {
      type: String,
      enum: ['passwordReset', 'emailVerify'],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Document auto supprimé à expiration
    },
  },
  {
    timestamps: true,
  }
);

const Token = mongoose.model('Token', tokenSchema);
export default Token;
