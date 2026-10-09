import mongoose from "mongoose";

let mainDbConnection = null;

const connectDB = async () => {
  if (mainDbConnection) return mainDbConnection;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    mainDbConnection = conn;
    console.log(`✅ MongoDB Connected to Main Database: ${conn.connection.host}`);
    return mainDbConnection;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;