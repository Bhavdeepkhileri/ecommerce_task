const express= require('express');
const auth = require('../middleware/authentication/auth')
const validation = require('../middleware/validation/signupvalid')
const loginValid = require('../middleware/validation/loginvalid')
const router= new express.Router();
const multer = require('multer');
const path= require('path');
const fs= require('fs');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../common/upload/userprofile'))
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
  })
   
  var upload = multer({ storage: storage })
//schema set up
const User = require('../models/user');


router.post('/api/v1/signup',upload.single('avatar'),validation,(req,res)=>{
    /*
    signup api and
    return 400 if email already in use
    */
    req.body.img=req.file.filename;
        const user = new User(req.body);
        user.save().then(() => {
            res.send({message:'successfully signed up'})
        }).catch((e) => {
            res.status(400)
            fs.unlinkSync( req.file.path )
            if(e.driver==true)
                res.send({message:"email already in use"});
            else 
                res.send(e);
        })
    
});

router.post('/api/v1/login',loginValid,async (req,res)=>{
    /*
    login validation api
    */
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ token })
    } catch (e) {
        res.status(400).send()
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

module.exports =router;