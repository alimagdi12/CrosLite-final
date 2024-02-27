const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profession :{
        type:String,
        required:false
    },
    image:{
        type : String,
        required : false
    },
    details:{
        type : String,
        required:true
    },
    rating:{
        type:String,
        required:true
    }
});

module.exports = mongoose.model('Review', reviewSchema);
