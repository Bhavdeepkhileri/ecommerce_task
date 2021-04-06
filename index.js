//all the module set up
require('./db/mongoose');
const express= require('express');
const path=require('path');
const cors=require('cors');
const ejs=require('ejs');
const bcrypt = require('bcrypt');

//schema set up
const mongoose=require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Transcation = require('./models/transcation');

//global variable set up
const port = 3000;
const commonpath=path.join(__dirname+'/common')
console.log(commonpath);

//express and middleware set up
const app=express();
app.use(express.json());
app.use(express.static(commonpath));
app.set('view engine', 'ejs');
app.use(cors());

app.get('/',(req,res)=>{
    /*
    rendering ejs file of the landing page
    */
    link = {login:`http://localhost:${port}/login.html`,
            signup:`http://localhost:${port}/signup.html`
            }

    ejs.renderFile(path.join(__dirname,'/common/home.ejs'),{link:link},(err,str)=>
    {
       res.send(str);
    })
})

app.post('/api/v1/signup',(req,res)=>{
    /*
    signup api and 
    return 400 if email already in use
    */
    const saltRounds = 10;
    const password = req.body.password;
    console.log(req.body);
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
                res.send("email id already in use");
            else 
                res.send(e);
        })
    });
    
});

app.post('/api/v1/login',async (req,res)=>{
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

app.post('/api/v1/add-item',(req,res)=>{
    /*
    adding item in the database with the help of emaild id of the user
    */
    User.findOne({email: req.body.email},(err,result)=>{
        if(err)
        {
            return res.send("some error occured");
        }
        let temp={}
        for (const [key, value] of Object.entries(req.body)) {
            if(key=='email')
            {
                temp['userId']=new mongoose.Types.ObjectId(result._id);
                continue;
            }
            temp[key]=value;
          }
        const product=new Product(temp);
        product.save().then(()=>{
            res.send("item is added to product list");
        }).catch((e)=>{res.send(e)})
    })
});

app.get('/api/v1/render',async (req,res)=>{
    /*
    rendering ejs page for showing product list and transaction history
    */
    var passedVariable = req.query.email;
    const user=await User.findOne({email: passedVariable});
    const quotation = await Product.find().exec();
    const transcation =await Transcation.find({userId:new mongoose.Types.ObjectId(user._id)}).populate('productId');
    console.log(path.join(__dirname,'/common/template.ejs'));
    ejs.renderFile(path.join(__dirname,'/common/templatefile.ejs'),{user:user,transcation:transcation,quotation:quotation},(err,str)=>
    {
       res.send(str);
    })
})

app.post('/api/v1/purchase-item',(req,res)=>{
    /*
    purchasing item with help of email of user and decreasing the quantity count in db
    */
    User.findOne({email: req.body.email},async (err,result)=>{
        if(err)
        {
            return res.send("some error occured");
        }
        let temp={}
        for (const [key, value] of Object.entries(req.body)) {
            if(key=='email')
            {
                temp['userId']=new mongoose.Types.ObjectId(result._id);
                continue;
            }
            if(key=='productId')
            {
                temp['productId']=new mongoose.Types.ObjectId(value);
                let obj= await Product.updateOne({_id: new mongoose.Types.ObjectId(value)},{$inc: {quantity:-1*+req.body.quantity}});
                continue;
            }
            temp[key]=value;
          }
        const product=new Transcation(temp);
        product.save().then(()=>{
            res.send("item is bought");
        }).catch((e)=>{res.send(e)})
    })
});

app.post('/api/v1/delete-item',async (req,res)=>{
    /*
    deleting prodcut , changing isDelete flag to true
    */
    const itemDeleted = await Product.updateOne({_id:new mongoose.Types.ObjectId(req.body.productId)},{$set:{IsDelete:true}});
    console.log(itemDeleted);
    res.send("item deleted")
})

app.post('/api/v1/update-item',async (req,res)=>{
    /*
    updating prodcut
    */
    const updateItem = await Product.updateOne({_id:new mongoose.Types.ObjectId(req.body.productId)},{$set:{productName:req.body.productName,
    price: req.body.price,
    quantity: req.body.quantity}});
    console.log(updateItem);
    res.send("item updated");
})

app.listen(port,()=>{
    console.log('server is running');
});
