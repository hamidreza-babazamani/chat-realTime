import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected"),
    );
    mongoose.connection.on("error", (err) =>
      console.log("DB Error:", err.message),
    );
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.log("Database Connection Error:", error.message);
    process.exit(1);
  }
};
