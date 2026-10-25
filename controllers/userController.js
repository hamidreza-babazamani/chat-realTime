import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken, sanitizeUser } from "../lib/utils.js";
import Message from "../models/Message.js";

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  const { fullName, email, password, bio } = req.body;
  try {
    if (!fullName || !email || !password || !bio)
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });

    if (password.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Account already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    // ⚠️ پسورد هرگز به کلاینت نمی‌رود
    res.status(201).json({
      success: true,
      userData: sanitizeUser(newUser),
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      userData: sanitizeUser(user),
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHECK AUTH ====================
export const checkAuth = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// ==================== GET PROFILE ====================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const updates = {};

    // فقط فیلدهای معتبر و غیرخالی
    if (typeof fullName === "string" && fullName.trim())
      updates.fullName = fullName.trim();
    if (typeof bio === "string") updates.bio = bio.trim();
    if (typeof profilePic === "string") updates.profilePic = profilePic;

    if (Object.keys(updates).length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Nothing to update" });

    const updated = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    }).select("-password");
    res.json({ success: true, user: updated });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== GET USER STATS ====================
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [messagesSent, messagesReceived] = await Promise.all([
      Message.countDocuments({ senderId: userId }),
      Message.countDocuments({ receiverId: userId }),
    ]);

    const [sentTo, receivedFrom] = await Promise.all([
      Message.distinct("receiverId", { senderId: userId }),
      Message.distinct("senderId", { receiverId: userId }),
    ]);

    const uniqueChats = new Set([
      ...sentTo.map(String),
      ...receivedFrom.map(String),
    ]).size;

    const lastMessage = await Message.findOne({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      stats: {
        messagesSent,
        messagesReceived,
        totalChats: uniqueChats,
        joinedAt: req.user.createdAt,
        lastActivity: lastMessage?.createdAt || req.user.createdAt,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });

    if (newPassword.length < 6)
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });

    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCorrect)
      return res
        .status(400)
        .json({ success: false, message: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
