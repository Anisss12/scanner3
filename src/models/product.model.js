import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Unique ID
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  design: { type: String, required: true },
  sizes: { type: [String], required: true }, // Array of sizes
  colors: { type: [String], required: true }, // Array of colors
  price: { type: Number, required: true }, // Store price as a number
  date: { type: Date, required: true, default: Date.now }, // Auto timestamp
});

// Create model
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
