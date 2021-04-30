const jwt = require('jsonwebtoken')
const User = require('../../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'secretkey')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        if(e.message == 'jwt expired')
        {
            return res.status(401).send({error:'session expired'});
        }
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

module.exports = auth