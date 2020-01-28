const mongoose = require("mongoose");

const CardsSchema = mongoose.Schema(
  {
    no: { type: Number, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    name: { type: String },
    user_id: { type: String, required: true },
    stripe_id: { type: String, required: true },
    default: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);
module.exports = mongoose.model("Cards", CardsSchema);
