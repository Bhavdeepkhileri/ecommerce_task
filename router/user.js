const express= require('express');
const bcrypt = require('bcrypt');
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
const mongoose=require('mongoose');
const User = require('../models/user');


router.post('/api/v1/signup',upload.single('avatar'),(req,res)=>{
    /*
    signup api and
    return 400 if email already in use
    */
    const saltRounds = 10;
    const password = req.body.password;
    req.body.img=req.file.filename;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        if(err)
        {
            return res.send("some error occured",err)
        }
        req.body.password=hash;
        const user = new User(req.body);
        user.save().then(() => {
            res.send({done:'successfully signed up'})
        }).catch((e) => {
            res.status(400)
            fs.unlinkSync( req.file.path )
            if(e.driver==true)
                res.send({value:true});
            else 
                res.send(e);
        })
    });
    
});

router.post('/api/v1/login',async (req,res)=>{
    /*
    login validation api
    */
    User.findOne({email: req.body.email},async (err,result)=>{
        if(err)
        {
            return res.send("some error occurred");
        }
        if(result==null)
        {
            return res.send({response:"Invalid user name or password"})
        }
        const match = await bcrypt.compare(req.body.password, result.password);
        if(!match)
        {
            return res.send({response:"Invalid user name or password"});
        }
        res.send({email: result.email});
    })
});

module.exports =router;