const mongoose = require('mongoose')

const CartItem = new mongoose.Schema({ 
    productId:{
        /*product id, which was purchased by the User */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required:true
    },
    quantity:{
        type: Number,
        default: 1
    }
 });


const Cart = mongoose.model('Cart',{
   
    userId:{ 
        /*person id, who uploaded product to sell*/
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        unqiue:true
    },


    products: {
        type:[CartItem],
        default: undefined
    }
  })


  module.exports = Cart;