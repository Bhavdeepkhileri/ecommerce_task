const mongoose = require('mongoose')
const validator = require('validator')

const Product = mongoose.model('Product', {
    productName:{
        type: String,
        trim: true,
        required: true 
    },
    userId: { 
        /*person id, who uploaded product to sell*/
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    price:{
        type:Number,
        required: true,
        default: 0,
        trim:true
    }
})

module.exports= Product;