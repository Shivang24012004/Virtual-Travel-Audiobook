import mongoose from "mongoose";

const audioFileSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    duration: { type: Number },
    description: { type: String },
  },
  { _id: true }
);

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    coordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v) => v.length === 2 && v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90,
          message: (props) => `${props.value} is not a valid [longitude, latitude] pair!`,
        },
      },
    },
    description: { type: String, trim: true },
    audioFiles: [audioFileSchema],
  },
  {
    timestamps: true,
  }
);

locationSchema.index({ coordinates: "2dsphere" });
locationSchema.index({ name: "text", description: "text" });

const Location = mongoose.model("Location", locationSchema);

export default Location;