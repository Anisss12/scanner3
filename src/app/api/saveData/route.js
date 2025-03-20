import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnection from "@/db/dbconnetion";
import Product from "@/models/product.model";

// ✅ POST: Add new product
export async function POST(req) {
  await dbConnection(); // Ensure DB is connected
  try {
    const newData = await req.json(); // Parse request body
    const newProduct = new Product(newData); // Create Mongoose document
    await newProduct.save(); // Save to MongoDB

    return NextResponse.json(
      { message: "Data saved successfully", data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  await dbConnection();
  try {
    const data = await Product.find();
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update existing product
export async function PUT(req) {
  await dbConnection(); // Ensure DB is connected
  try {
    const { id, ...updatedData } = await req.json(); // Get ID and other fields

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid ID format" },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updatedData, {
      new: true, // Return updated document
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product updated successfully", data: updatedProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { ids } = await req.json(); // Extract IDs from request

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Invalid ID list" }, { status: 400 });
    }

    // Ensure all IDs are valid MongoDB ObjectIds
    const objectIds = ids
      .map((id) => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          return new mongoose.Types.ObjectId(id);
        }
        return null;
      })
      .filter((id) => id !== null); // Remove invalid IDs

    if (objectIds.length === 0) {
      return NextResponse.json(
        { error: "No valid ObjectIds found" },
        { status: 400 }
      );
    }

    // Delete multiple records
    await Product.deleteMany({ _id: { $in: objectIds } });

    return NextResponse.json(
      { message: "Deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
