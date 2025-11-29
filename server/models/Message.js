import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel',
      required: true,
    },
    senderModel: {
      type: String,
      enum: ['user', 'Seller'],
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'receiverModel',
      required: true,
    },
    receiverModel: {
      type: String,
      enum: ['user', 'Seller'],
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);

export default Message;