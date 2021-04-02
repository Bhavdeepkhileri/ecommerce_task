const mongoose=require('mongoose');

const Transcation=mongoose.model('Transcation',{
    productId:{
        /*poduct id, which was purchased by the User */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'Product'
    },
    userId:{
        /*person id,who purchased the item */
        type:   mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    quantity:{
        type: Number,
        default: 1,
    }
})

exports.model=Transcation;