const express= require('express');
const bcrypt = require('bcrypt');
const router= new express.Router();
//schema set up
const mongoose=require('mongoose');
const User = require('../models/user');


router.post('/api/v1/signup',(req,res)=>{
    /*
    signup api and 
    return 400 if email already in use
    */
    const saltRounds = 10;
    const password = req.body.password;
    bcrypt.hash(password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        if(err)
        {
            return res.send("some error occured",err)
        }
        req.body.password=hash;
        const user = new User(req.body);
        user.save().then(() => {
            res.send(user)
        }).catch((e) => {
            res.status(400)
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
        console.log(result);
        res.send({email: result.email});
    })
});

module.exports =router;