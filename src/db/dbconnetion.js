import mongoose from "mongoose";

const dbConnection = async () => {
  const { DB_NAME, DB_USER, DB_PASSWORD } = process.env;

  if (!DB_NAME || !DB_USER || !DB_PASSWORD) {
    console.error(
      "❌ Missing required environment variables for MongoDB connection"
    );
    process.exit(1);
  }

  const MONGO_URI = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.thwia.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB is already connected");
      return;
    }

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

export default dbConnection;
