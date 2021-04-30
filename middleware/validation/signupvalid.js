const Joi = require('joi')

const schema= Joi.object({
    name:Joi.string()
        .min(3)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*]{3,}$')),

    email: Joi.string()
        .email(),
    
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