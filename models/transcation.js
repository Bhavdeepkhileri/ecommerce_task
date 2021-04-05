const mongoose=require('mongoose');
const validator=require('validator')

const Transcation=mongoose.model('Transcation',{
    productId:{
        /*product id, which was purchased by the User */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'Product',
        required:true
    },
    userId:{
        /*person id,who purchased the item */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required:true
    },
    quantity:{
        type: Number,
        default: 1,
        required:true
    },
    totalAmount:{
        type: Number,
        required: true
    }
})

module.exports =Transcation;