import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, trim: true },
    image: { type: String },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ایندکس مرکب برای کوئری سریع مکالمه
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);
