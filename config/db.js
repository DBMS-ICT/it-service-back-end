import mongoose from "mongoose";

// Function to connect to the MongoDB database
export const connectDb = async () => {
  try {
    // Connect to the database using the provided DB_URL
    await mongoose.connect(process.env.DB_URL);
    console.log("Database connected successfully!");
  } catch (error) {
    // Handle any errors that occur during the database connection
    console.log("Error connecting to the database:", error);
  }
};