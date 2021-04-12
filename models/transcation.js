const mongoose=require('mongoose');
const validator=require('validator')

const product = new mongoose.Schema({ 
    productId:{
        /*product id, which was purchased by the User */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required:true
    },
    quantity:{
        type: Number,
        default: 1,
        required: true
    }
 });


const Transcation=mongoose.model('Transcation',{
    products:{
        /*product id, which was purchased by the User */
        type:   [product], 
        default: undefined ,
        required:true
    },
    userId:{
        /*person id,who purchased the item */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required:true
    },
    totalAmount:{
        type: Number,
        required: true
    }
})

module.exports =Transcation;