import { Schema, model, Document, Types } from "mongoose";

export interface IQuestion extends Document {
         // owner (required)
  user:Types.ObjectId;
  category: Types.ObjectId;            
  question: string;
  answer: string;

}

const QuestionSchema = new Schema<IQuestion>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },

    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 20000,  // let answers be long
    },

   
  },
  { timestamps: true, versionKey: false }
);
// Enforce: per user + category, the same question text must be unique
QuestionSchema.index({ user: 1, category: 1, question: 1 }, { unique: true });



const Question = model<IQuestion>("Question", QuestionSchema);
export default Question;
