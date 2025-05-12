import mongoose, { Schema, Document } from 'mongoose';

export interface CommentDocument extends Document {
  bookingId: string;
  comment: string;
  rating: number;
  status: 'pending' | 'confirmed';
  createdAt: Date;
  updatedAt: Date;
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CommentSchema = new Schema<CommentDocument>(
  {
    bookingId: {
      type: String,
      required: true,
      match: [uuidRegex, 'Invalid UUID format for bookingId'],
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      required: true,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// ✅ Ensure one comment per booking
CommentSchema.index({ bookingId: 1 }, { unique: true });

export const CommentModel = mongoose.model<CommentDocument>(
  'Comment',
  CommentSchema
);
