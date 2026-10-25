import jwt from "jsonwebtoken";

export const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// حذف پسورد از آبجکت کاربر قبل از ارسال به کلاینت
export const sanitizeUser = (user) => {
  if (!user) return null;
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};
