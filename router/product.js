const express= require('express');
const ejs=require('ejs');
const router= new express.Router();
const multer= require('multer');
const path= require('path');
const fs= require('fs');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname,'../common/upload/product-image'))
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+path.extname(file.originalname))
    }
  })
   
  var upload = multer({ storage: storage })
//schema set up
const mongoose=require('mongoose');
const User = require('../models/user');
const Product = require('../models/product');
const Transcation = require('../models/transcation');



router.post('/api/v1/add-item',upload.single('img'),(req,res)=>{
    /*
    adding item in the database with the help of emaild id of the user
    */
    //let buf = Buffer.from(encoded, 'base64');
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
          temp['img']=req.file.filename;
        const product=new Product(temp);
        product.save().then(()=>{
            res.send("item is added to product list");
        }).catch((e)=>{res.send(e)})
    })
});
router.get('/api/v1/transaction-history',async (req,res)=>
{
    var passedVariable = req.query.email;
    const user=await User.findOne({email: passedVariable});
    if(user==null)
        return res.send("user does not exist");
    const transcation =await Transcation.find({userId:new mongoose.Types.ObjectId(user._id)}).populate('products.productId');
   // console.log(transcation[0])
    ejs.renderFile(path.join(__dirname,'../common/transactionRenderFile.ejs'),{user:user,transcation:transcation},(err,str)=>
    {
       res.send(str);
    })
})
router.get('/api/v1/render',async (req,res)=>{
    /*
    rendering ejs page for showing product list and transaction history
    */
    var passedVariable = req.query.email;
    const user=await User.findOne({email: passedVariable});
    if(user==null)
        return res.send("user does not exist");
    const quotation = await Product.find({}).populate('userId')
    ejs.renderFile(path.join(__dirname,'../common/templatefile.ejs'),{user:user,quotation:quotation},(err,str)=>
    {
       res.send(str);
    })
})

router.post('/api/v1/purchase-item',(req,res)=>{
    /*
    purchasing item with help of email of user and decreasing the quantity count in db
    */
    User.findOne({email: req.body.email},async (err,result)=>{
        if(err)
        {
            return res.send("some error occured");
        }
        let temp={}
        let send=[];
        for (const [key, value] of Object.entries(req.body)) {
            if(key=='email')
            {
                temp['userId']=new mongoose.Types.ObjectId(result._id);
                continue;
            }
            if(key=='productId')
            {
                temp['products']={};
                temp['products']['productId']=new mongoose.Types.ObjectId(value);
                temp['products']['quantity']=+req.body.quantity;
                let product =await Product.findOne({_id: new mongoose.Types.ObjectId(value)});
                product instanceof Product; // true
                product instanceof mongoose.Model; // true
                product instanceof mongoose.Document; // true
                if(product.quantity< +req.body.quantity)
                {
                    return res.send("item cannot be bought");
                }
                product.quantity-=+req.body.quantity;
                await product.save();
                continue;
            }
            temp[key]=value;
          }
        const transaction=new Transcation(temp);
        transaction.save().then(()=>{
            res.send("item is bought");
        }).catch((e)=>{res.send(e)})
    })
});

router.post('/api/v1/delete-item',async (req,res)=>{
    /*
    deleting prodcut , changing isDelete flag to true
    */
    const itemDeleted = await Product.updateOne({_id:new mongoose.Types.ObjectId(req.body.productId)},{$set:{IsDelete:true}});
    console.log(itemDeleted);
    res.send("item deleted")
})

router.post('/api/v1/update-item',upload.single(),async (req,res)=>{
    /*
    updating prodcut
    */
    const updateItem = await Product.updateOne({_id:new mongoose.Types.ObjectId(req.body.productId)},{$set:{productName:req.body.productName,
    price: req.body.price,
    quantity: req.body.quantity}});
    res.send("item updated");
})

module.exports=router;