import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    default: "User"
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    default: ""
  },
  cartItems: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true,
  minimize: false
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;