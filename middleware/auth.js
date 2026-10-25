import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    // پشتیبانی از هر دو حالت: Authorization: Bearer و هدر token
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : req.headers.token;

    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, no token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
};
