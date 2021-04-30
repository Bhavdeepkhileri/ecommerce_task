const Joi = require('joi')

const schema= Joi.object({
    productName:Joi.string()
        .required(),

    price: Joi.number().integer().positive().required(),

    quantity: Joi.number().integer().positive().required(),
    
})

const validation = async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);
        next();
    }
    catch(e){
        res.status(400).send( {message : "incomplete or incorrect information",e})
    }
}

module.exports = validation;