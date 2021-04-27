const express = require("express");
const path = require("path");
const ejs = require("ejs");
const router = new express.Router();
const auth = require('../middleware/auth')
//schema set up
const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const Transcation = require("../models/transcation");
const Cart = require("../models/cart");



router.post("/api/v1/add-to-cart",auth, async (req, res) => {
  let findCart = await Cart.findOne({
    userId: new mongoose.Types.ObjectId(req.user._id),
  });
  if (findCart == null) {
    const cart = new Cart({
      userId: new mongoose.Types.ObjectId(req.user._id),
      products: [],
    });
    try {
      await cart.save();
    } catch (err) {
      console.log(err);
    }
    findCart = cart;
  }
  let productarray=findCart.products
  for(let i=0; i<productarray.length;i++)
  {
    if(req.body.productId==productarray[i].productId)
    {
      findCart.products[i].quantity+= +req.body.quantity;
      await findCart.save();
      //await Product.updateOne({_id: new mongoose.Types.ObjectId(req.body.productId)},{$inc:{quantity:-req.body.quantity}})
      return res.send("item added to cart");
    }
  }
  try {
    let obj = await Cart.updateOne(
      { _id: new mongoose.Types.ObjectId(findCart._id) },
      {
        $push: {
          products: {
            productId: req.body.productId,
            quantity: req.body.quantity,
          },
        },
      }
    ).exec();
    //await Product.updateOne({_id: new mongoose.Types.ObjectId(req.body.productId)},{$inc:{quantity:-req.body.quantity}})
    res.send("item added to cart");
  } catch (err) {
    console.log(err);
    err.stack;
  }
});

router.post('/api/v1/edit-cart',auth,async(req,res)=>{
  try{
  const user=await User.findOne({email: req.body.email});
  const cart=await Cart.updateOne({userId: new mongoose.Types.ObjectId(user._id)},
                                  {$set:{"products.$[elem].quantity": +req.body.quantity}},
                                  {
                                    arrayFilters:[{"elem.productId":{$eq: new mongoose.Types.ObjectId(req.body.productId)}}]
                                  });
   console.log(cart);
   res.send("cart updated");
  }
  catch(err)
  {
    console.log(err)
    res.send("error")
  }
})

router.get('/api/v1/render-cart',auth,async(req,res)=>{
  const user=req.user
  if(user==null)
      return res.send("user does not exist");
  const quotation = await Cart.findOne({userId: new mongoose.Types.ObjectId(user._id)}).populate('products.productId')
  //console.log();
  ejs.renderFile(path.join(__dirname,'../view/cart.ejs'),{cart:quotation},(err,str)=>
  {
    res.send(str);
 })
});

router.post('/api/v1/cart-remove-item',async(req,res)=>{
  //console.log(req.body.email, req.body.productId)
  const user = await User.findOne({ email: req.body.email });
  const removed = await Cart.findOneAndUpdate({userId: new mongoose.Types.ObjectId(user._id)},{
    $pull:{products:{
      productId: new mongoose.Types.ObjectId(req.body.productId)}
    }
  })
  //await Product.updateOne({_id: new mongoose.Types.ObjectId(req.body.productId)},{$inc:{quantity:-req.body.quantity}})
  //console.log(removed);
  res.send('item removed from the cart');
})

router.post('/api/v1/checkout',async(req,res)=>{
  const user = await User.findOne({ email: req.body.email });
  const cart = await Cart.findOne({userId: new mongoose.Types.ObjectId(user._id)}).populate('products.productId');
  cart instanceof Cart; // true
  cart instanceof mongoose.Model; // true
  cart instanceof mongoose.Document; // true
  let checkoutObj={
    products:cart.products,
    totalAmount: req.body.totalAmount,
    userId: new mongoose.Types.ObjectId(user._id)
  }
  if(cart.products.length==0)
  {
    return res.send("cart is empty");
  }
  for(let i=0; i<cart.products.length;i++)
  {
    try{
    //await Product.updateOne({_id: cart.products[i].productId},{$inc: {quantity:-1*+cart.products[i].quantity}});
     // console.log(cart.products[i].productId._id);
    let product =await Product.findOne({_id: new mongoose.Types.ObjectId(cart.products[i].productId._id)});
      product instanceof Product; // true
      product instanceof mongoose.Model; // true
      product instanceof mongoose.Document; // true
      if(product.quantity< cart.products[i].quantity)
      {
          return res.send("some item in cart are out of stock remove them to checkout");
      }
      product.quantity-=+cart.products[i].quantity;
      await product.save();
    }
    catch(err)
    {
      console.log(err);
    }
  }
  cart.products=[]
  await cart.save();
  const transaction = new Transcation(checkoutObj)
  transaction.save().then(()=>{
    res.send("items are bought");
}).catch((e)=>{res.send(e)})
})

module.exports = router;
