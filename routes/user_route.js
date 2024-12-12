var express = require("express");
var exe = require("./../connection");
var url = require("url");
var router = express.Router();

function checklogin(req,res,next)
{
    if(req.session.user_id != undefined)
    next();
    else
    res.send("<script>alert('Invalid Login');location.href = '/login';</script>");
}

router.get("/",async function(req,res)
{
    console.log(req.session);
    var banner_info = await exe("SELECT * FROM banner");
    var why_choose_us_info = await exe("SELECT * FROM why_choose_us");
    var key_point_info = await exe("SELECT * FROM key_point");
    var modern_interior_info = await exe("SELECT * FROM modern_interior");
    var testimonials_info = await exe("SELECT * FROM testimonials");
    var blog_info = await exe("SELECT * FROM blog");
    var products=await exe('select * from product order by product_id desc limit 0,4');

    var obj = {"banner_info":banner_info[0],
                "why_choose_us_info":why_choose_us_info[0],
                "key_point_info":key_point_info,
                "modern_interior_info":modern_interior_info[0],
                "testimonials_info":testimonials_info,
                "blog_info":blog_info,
                "products":products,
                "is_login" : ((req.session.user_id) ? true:false),
              };
    res.render("user/home.ejs",obj);
});
router.get("/shop",async function(req,res)
{
    var ttl_products = (await exe("SELECT COUNT(product_id) as ttl FROM product"))[0].ttl;
    var per_page = 3;
    var ttl_pages = (parseInt(ttl_products/per_page) < ttl_products/per_page) ? parseInt(ttl_products/per_page)
    +1:parseInt(ttl_products/per_page);
    
    var url_data = url.parse(req.url,true).query;
    var page_no = 1;
    if(url_data.page_no)
      page_no =url_data.page_no;
    
    var start = (page_no*per_page)-per_page;
    // console.log(ttl_products);
    var products = await exe(`SELECT * FROM product LIMIT ${start},${per_page}`);
    var shop_banner_info = await exe("SELECT * FROM shop_banner");


    var obj = { "is_login" : ((req.session.user_id) ? true:false),
                 "products":products,
                 "ttl_pages":ttl_pages,
                 "page_no":page_no,
                 "shop_banner_info":shop_banner_info[0]
                };
    res.render("user/shop.ejs",obj);
});
router.get("/about",async function(req,res)
{
    var banner_info = await exe("SELECT * FROM aboutus_banner");
    var why_choose_us_info = await exe("SELECT * FROM why_choose_us");
    var key_point_info = await exe("SELECT * FROM key_point");
    var about_team_info = await exe("SELECT * FROM about_team");
    var testimonials_info = await exe("SELECT * FROM testimonials");

    var obj = { "is_login" : ((req.session.user_id) ? true:false),
               "banner_info":banner_info[0],
                "why_choose_us_info":why_choose_us_info[0],
                "key_point_info":key_point_info,
                "about_team_info":about_team_info,
                "testimonials_info":testimonials_info,
            };
    res.render("user/about.ejs",obj);
});
router.get("/services",async function(req,res)
{ 
    var services_banner = await exe("SELECT * FROM services_banner");
    var key_point_info = await exe("SELECT * FROM key_point");
    var testimonials_info = await exe("SELECT * FROM testimonials");
    var obj = { "is_login" : ((req.session.user_id) ? true:false),
               "services_banner":services_banner[0],
               "key_point_info":key_point_info,
               "testimonials_info":testimonials_info
              };
    res.render("user/services.ejs",obj);
});
router.get("/blog",async function(req,res)
{
    var blog_banner = await exe("SELECT * FROM blog_banner");
    var blog_info = await exe("SELECT * FROM blog");
    var testimonials_info = await exe("SELECT * FROM testimonials");
    var obj = { "is_login" : ((req.session.user_id) ? true:false),
                 "blog_banner":blog_banner[0],
                 "blog_info":blog_info,
               "testimonials_info":testimonials_info
              };
    res.render("user/blog.ejs",obj);
});
router.get("/contact",async function(req,res)
{
    var contact_banner = await exe("SELECT * FROM contact_banner");
    var obj = { "is_login" : ((req.session.user_id) ? true:false),
                "contact_banner":contact_banner[0]
        };

    res.render("user/contact.ejs",obj);
});


router.post("/save_from", async function(req,res)
{
    var d = req.body;
    var sql = `INSERT INTO contact_from(fname,lname,email,message)
    VALUES ('${d.fname}','${d.lname}', '${d.email}','${d.message}')`;

     var data = await exe(sql);
    //  res.send(data);
    res.redirect("/contact");
});

router.get("/profile",checklogin, async function(req,res)
{
    var hrishi = await exe(`SELECT * FROM user_tbl WHERE user_id = '${req.session.user_id}'`);
    var profile = await exe(`SELECT * FROM user_tbl`);
    var obj = { "is_login" : ((req.session.user_id) ? true:false),
                "profile":profile[0],
                "hrishi":hrishi[0]
            
                 };
    res.render("user/profile.ejs",obj);
});
router.get("/login",function(req,res)
{
    var obj = { "is_login" : ((req.session.user_id) ? 
    true:false)};
    res.render("user/login.ejs",obj);
});
router.get("/signup",function(req,res)
{
    var obj = { "is_login" : ((req.session.user_id) ? 
    true:false)};
    res.render("user/signup.ejs",obj);
});
router.post("/do_register",async function(req,res)
{
    var d = req.body;
    if(req.files!=null)
    {
        var user_photo = new Date().getTime() + req.files.	user_photo.name;
        req.files.user_photo.mv("public/uploads/"+user_photo)

        var sql = `INSERT INTO user_tbl(user_name, mobile_number,email_id,user_gender,password,user_photo) VALUES ('${d.user_name}', '${d.mobile_number}', '${d.email_id}', '${d.user_gender}', '${d.password}','${user_photo}')`;
        await exe (sql);
        res.redirect("/login");


    }
    else{
        var sql = `INSERT INTO user_tbl(user_name, mobile_number,email_id,user_gender,password,user_photo) VALUES ('${d.user_name}', '${d.mobile_number}', '${d.email_id}', '${d.user_gender}', '${d.password}','https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi5IJewE6kedymk3Nw_VZO3XMz7G4EtA7TsA&s')`;
        await exe(sql); 
        res.redirect("/login");
    }
      
    // res.send(data);
});
router.post("/do_login",async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM user_tbl WHERE mobile_number='${d.mobile_number}' AND password = '${d.password}'`;
    var data = await exe(sql);
    if(data.length > 0)
    {
        req.session.user_id = data[0].user_id;
        res.redirect("/");
    }
    else
    {
        res.send("<script>alert('Invalid Details'); history.back();</script>");
    }
    // res.send(req.body);
});


router.get("/product_info/:product_id",async function(req,res)
{
var product_id = req.params.product_id;
    var product_det = await exe(`SELECT * FROM product,product_type WHERE product_type.product_type_id=product.product_type_id AND product_id = '${product_id}'`);
    var user_id = req.session.user_id
    var checkcart = await exe(`SELECT * FROM  user_cart WHERE user_id = '${user_id}'AND product_id = '${product_id}'`);
    console.log(checkcart);

    obj = { 
        "is_login" : (req.session.user_id) ? true:false,
        "product_det" :product_det[0],
        "in_cart": (checkcart.length>0) ? true:false
   }
    res.render("user/product_info.ejs",obj);
});
router.get("/add_to_cart/:product_id",async function(req,res){
    user_id = req.session.user_id
    product_id = req.params.product_id
    qty = 1
    if(user_id == undefined)
    res.send(`<script>alert('Invalid User, Login Now...');
     location.href = '/login';</script>'`);
     else
     {
        var sql =`SELECT * FROM user_cart WHERE user_id = '${user_id}' AND  product_id='${product_id}'`;

        var check = await exe(sql);

        if(check.length == 0)
        {

            // User_cart
        // CREATE TABLE user_cart(user_cart_id  INT PRIMARY KEY AUTO_INCREMENT,user_id INT ,product_id INT ,qty INT)
        var sql2 = `INSERT INTO user_cart (user_id,product_id,qty) VALUES ('${user_id}','${product_id}','${qty}')`;
        // res.send("Adding In Cart"+user_id);
        var data = await exe(sql2);

        }
        // res.send(data);
        res.redirect("/product_info/"+product_id);
        

     }

});

router.get("/cart",checklogin,async function(req,res)
{
    var user_id = req.session.user_id
    var cart_product = await exe(`SELECT * FROM user_cart,product 
    WHERE product.product_id = user_cart.product_id AND user_id = '${user_id}'`);
    var obj = { "is_login" : ((req.session.user_id) ? true:false),
                "products" : cart_product,
              };
    res.render("user/cart.ejs",obj);
});



router.get("/decrease_qty/:user_cart_id",async function(req,res){
    var user_cart_id = req.params.user_cart_id;
    var sql = `SELECT * FROM user_cart,product WHERE product.product_id=user_cart.product_id AND  user_cart_id = '${user_cart_id}'`;

    var data = await exe(sql);
    var new_qty = data[0].qty - 1;
    var price = data[0].product_price;
   

    if(new_qty > 0)
    {
        var total = new_qty*price;
        sql = `UPDATE user_cart SET qty= '${new_qty}' WHERE user_cart_id = '${user_cart_id}'`;
          var data = exe(sql);
        res.send({"new_qty":new_qty,"total":total});

    }
    else{
        var total =data[0].qty*price;
        res.send({"new_qty":data[0].qty,"total":total});
    }
});



router.get("/increase_qty/:user_cart_id",async function(req,res){
    var sql = `UPDATE user_cart SET qty=qty+1  WHERE user_cart_id = '${req.params.user_cart_id}'`;
    var data = await exe(sql);
    var sql = `SELECT * FROM  user_cart,product WHERE user_cart.product_id=product.product_id  AND user_cart_id = '${req.params.user_cart_id}'`;
    var data = await exe(sql);
    var new_qty = data[0].qty;
    var price = data[0].product_price;
    var total = new_qty * price;
    res.send({"new_qty":new_qty,"total":total});
   
});

router.get("/delete_from_cart/:id",async function(req,res){
    var sql =` DELETE  FROM user_cart WHERE user_cart_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/cart");
});

router.get("/checkout/",checklogin, async function(req,res)
{
    var user_id=req.session.user_id;

    var products= await exe(`select *from user_cart c ,product p where p.product_id = c.product_id and user_id='${user_id}' `);

    var carts = await exe(`SELECT * FROM user_cart, product WHERE user_cart.product_id = product.product_id AND user_cart.user_id = '${req.session.user_id}'`);
    

    // console.log(req.session.user_id);
    obj = { 
        "is_login" : (req.session.user_id) ? true:false,
         "products":products,
         "user_id":user_id,
         "carts":carts,
   };
   res.render("user/checkout.ejs",obj);
    
});


router.post("/place_order",checklogin,async function(req,res)
{

   req.body.order_date = String(new Date().toISOString()).slice(0,10);
    var d= req.body;
    var order_status = "pending";
    if(d.payment_mode == 'online')
        order_status = 'payment_pending';


    var sql =`INSERT INTO order_tbl(country,c_fname,c_lname,c_address,c_area,c_state,c_postal_zip,c_email_address,c_phone,payment_mode,order_date,order_status,payment_status,user_id) VALUES ('${d.country}','${d.c_fname}','${d.c_lname}','${d.c_address}','${d.c_area}','${d.c_state}','${d.c_postal_zip}','${d.c_email_address}','${d.c_phone}','${d.payment_mode}','${d.order_date}','${order_status}','pending','${req.session.user_id}')`;

    var data = await exe(sql);

    var cart_products = await exe(`SELECT * FROM user_cart,product WHERE product.product_id = user_cart.product_id AND user_id = '${req.session.user_id}'`);
    var ttl = 0;
    for(var i=0;i<cart_products.length;i++)
    {
        order_id = data.insertId;
        user_id = req.session.user_id;
        product_id = cart_products[i].product_id;
        product_qty = cart_products[i].qty;
        product_price = cart_products[i].product_price;
        product_name = cart_products[i].product_name;
        product_details = cart_products[i].product_details;
        ttl+=(cart_products[i].qty*cart_products[i].product_price);

        sql =`INSERT INTO order_products(order_id,user_id,product_id,product_qty,product_price,product_name,product_details) VALUES ('${order_id}','${user_id}','${product_id}','${product_qty}','${product_price}','${product_name}','${product_details}')`;

        record = await exe(sql);
        console.log(record);
    }

    var sql =`DELETE  FROM  user_cart WHERE user_id = '${req.session.user_id}'`;
    await exe(sql);
    if(order_status == 'payment_pending')
    res.redirect("/pay_payment/"+data.insertId+"/"+ttl);
else
    res.redirect("/my_orders/");
});


router.get("/my_orders",async function(req,res)
{
    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM order_products WHERE order_products.order_id = order_tbl.order_id) as total_amt FROM order_tbl WHERE  user_id = '${req.session.user_id}' AND  order_status != 'payment_pending'`;
    var orders = await exe(sql);
    var obj = {
        "orders":orders,
        "is_login" : (req.session.user_id) ? true:false,
    };
        res.render("user/my_orders.ejs",obj);
});

router.get("/pay_payment/:order_id/:amt",checklogin,async function(req,res)
{
    // razorpay
     
     var obj = {
        "order_id":req.params.order_id,
        "amt":req.params.amt
    }
    // res.send(obj)
    res.render('user/pay_payment.ejs',obj);
});

router.post("/payment_success/:order_id", async function(req,res)
{
   var  order_id = req.params.order_id;
   var transaction_id = req.body.razorpay_payment_id;
   var today = new Date().toISOString().slice(0,10);


   var sql  = `UPDATE order_tbl SET  order_status = 'pending',payment_status ='complete',transaction_id='${transaction_id}',payment_date = '${today}' Where order_id = '${order_id}'`;

   var data = await exe(sql);
    // res.send(data);
    res.redirect("/my_orders");
});

router.get('/logout',  function (req, res, next)  {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

  router.get("/print_order/:id",function(req,res)
  {    
     var  obj = {
          "is_login" : (req.session.user_id) ? true:false,
  
      }
      res.render("user/print_order.ejs",obj)
  
  });

module.exports = router;