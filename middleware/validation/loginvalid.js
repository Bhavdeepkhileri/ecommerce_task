const Joi = require('joi')

const schema= Joi.object({
    email: Joi.string()
        .email(),
    
    password: Joi.string(),
    
})

const validation = async (req, res, next) => {
    try {
        const value = await schema.validateAsync(req.body);
        next();
    }
    catch(e){
        res.status(400).send( {message : "email id or password is correct",e})
    }
}

module.exports = validation;