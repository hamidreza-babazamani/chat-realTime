import User from "../models/User.js";
import Message from "../models/Message.js";
import { emitToUser } from "../lib/socket.js";

// ==================== GET USERS FOR SIDEBAR ====================
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // همه کاربران به جز خودم
    const users = await User.find({ _id: { $ne: userId } })
      .select("fullName email profilePic bio createdAt")
      .lean();

    // ✅ یک کوئری aggregate به جای N+1
    const unseenAgg = await Message.aggregate([
      { $match: { receiverId: userId, seen: false } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } },
    ]);

    const unseenMessages = {};
    unseenAgg.forEach((u) => {
      unseenMessages[u._id.toString()] = u.count;
    });

    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET MESSAGES ====================
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // قدیمی به جدید

    // پیام‌های دریافتی را seen کن
    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId, seen: false },
      { seen: true },
    );

    // ✅ به فرستنده بگو پیام‌هایش دیده شد (realtime)
    emitToUser(selectedUserId.toString(), "messagesSeen", {
      by: myId.toString(),
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MARK MESSAGE AS SEEN ====================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message)
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });

    // ✅ فقط گیرنده اجازه دارد seen کند
    if (message.receiverId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not allowed" });

    message.seen = true;
    await message.save();

    emitToUser(message.senderId.toString(), "messageSeen", {
      messageId: message._id.toString(),
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SEND MESSAGE ====================
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    // ✅ اعتبارسنجی
    if (!text && !image)
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });

    if (receiverId === senderId.toString())
      return res
        .status(400)
        .json({ success: false, message: "Cannot send message to yourself" });

    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists)
      return res
        .status(404)
        .json({ success: false, message: "Receiver not found" });

    // TODO: در آینده آپلود واقعی به Cloudinary
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || undefined,
      image: image || undefined,
    });

    // به گیرنده
    emitToUser(receiverId, "newMessage", newMessage);
    // به تب‌های فرستنده (sync بین چند تب)
    emitToUser(senderId.toString(), "messageSent", newMessage);

    res.status(201).json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
