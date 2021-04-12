//all the module set up
require('./db/mongoose');
const express= require('express');
const path=require('path');
const cors=require('cors');
const ejs=require('ejs');
const userRouter=require('./router/user')
const productRouter=require('./router/product')
const cartRouter=require('./router/cart')
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
app.use(userRouter);
app.use(productRouter);
app.use(cartRouter);

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



app.listen(port,()=>{
    console.log('server is running');
});
