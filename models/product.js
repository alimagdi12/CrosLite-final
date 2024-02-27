const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  category:{
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  details:{
    type:String,
    required:true
  },
  imageUrl: {
    type: String,
    required: true
  },
  rating:{
    type:Number,
    required:false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);
