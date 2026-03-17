/*import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
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
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;*/


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id:{type:String, required:true},
  name:{type:String, required:true},
  email:{type:String, required:true,unique:true},
  imageUrl:{type:String, default:""},
  cartItems:{type:Object, default:{}},
},{minimize:false})

const User = mongoose.models.user ||mongoose.model('user',userSchema)

export default User 