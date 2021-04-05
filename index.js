require('./db/mongoose');
const express= require('express');
const path=require('path');
const cors=require('cors');
const ejs=require('ejs');

const mongoose=require('mongoose');
const User = require('./models/user');
const Product = require('./models/product');
const Transcation = require('./models/transcation');

const port = 3000;
const commonpath=path.join(__dirname+'/common')
console.log(commonpath);

const app=express();
app.use(express.json());
app.use(express.static(commonpath));
app.set('view engine', 'ejs');
app.use(cors());

app.post('/api/v1/signup',(req,res)=>{
    console.log(req.body);
    const user = new User(req.body)

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

app.post('/api/v1/login',(req,res)=>{

    User.findOne({email: req.body.email},(err,result)=>{
        if(err)
        {
            return res.send("some error occurred");
        }
        if(result==null || req.body.password!=result.password)
            return res.send("Invalid user name or password");

        console.log(result);
        /* Transcation.find({userId: new mongoose.Types.ObjectId(result._id)},(error,fmResult)=>
        {   
            if(error)
            {
                return res.send("bad");
            }
            console.log(fmResult);
            res.send(fmResult);
        }) */
        res.send({email: result.email});
    })
});

app.post('/api/v1/add-item',(req,res)=>{
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
    var passedVariable = req.query.email;
    const user=await User.findOne({email: passedVariable});
    const quotation = await Product.find();
    const transcation =await Transcation.find({userId:new mongoose.Types.ObjectId(user._id)});[]
    for(let i=0; i<transcation.length; i++)
    {
        let product= await Product.findOne({_id:new mongoose.Types.ObjectId(transcation[i].productId)});
        transcation[i]['productName']=product['productName'];
    }
    console.log(path.join(__dirname,'/common/template.ejs'));
    ejs.renderFile(path.join(__dirname,'/common/templatefile.ejs'),{user:user,transcation:transcation,quotation:quotation},(err,str)=>
    {
        //console.log(err,str);
        res.send(str);
    })
})

app.post('/api/v1/purchase-item',(req,res)=>{
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
    const itemDeleted = await Product.updateOne({_id:new mongoose.Types.ObjectId(req.body.productId)},{$set:{IsDelete:true}});
    console.log(itemDeleted);
})


app.listen(port,()=>{
    console.log('server is running');
});
