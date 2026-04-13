import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  userId:{type:String, required:true},
  name:{type:String, required:true},
  description:{type:String, required:true},
  price:{type:Number, required:true},
  offerPrice:{type:Number, required:true},
 image: {
  type: [String],
  required: true,
  validate: v => v.length > 0
},
  category:{type:String, required:true},
  date:{type:Number, required:true},
  
},{
  timestamps: true,
  minimize: false})

const Product = mongoose.models.Product || mongoose.model('Product',productSchema)

export default Product