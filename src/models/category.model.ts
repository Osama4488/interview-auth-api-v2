import { Schema, model, Document, Types } from "mongoose";

export interface ICategory extends Document {
  user: Types.ObjectId;          // owner (required)
  category: string;              // e.g., "mern", "react", "js"
  description?: string;
}

const CategorySchema = new Schema<ICategory>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,           // normalize so "React" === "react"
      minlength: 2,
      maxlength: 80,
    },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true, versionKey: false }
);

// Uniqueness per user
CategorySchema.index({ user: 1, category: 1 }, { unique: true });

const Category = model<ICategory>("Category", CategorySchema);
export default Category;
