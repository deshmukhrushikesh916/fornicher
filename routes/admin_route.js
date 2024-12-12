var express = require("express");
var url = require("url");
var exe = require("./../connection");
var router = express.Router();

router.get('/admin_login',function(req,res){
    res.render('admin/login.ejs');
})

router.post('/check_admin',async function(req,res){
var d=req.body;
var sql =`SELECT * FROM admin_tbl WHERE admin_email = '${d.admin_email}' AND admin_password = '${d.admin_password}'`;
var data=await exe(sql);
// res.send(data);
if(data.length>0){
    var id=data[0].admin_id;
    req.session.admin_id = id;
    res.redirect("/admin");
    // console.log(req.session.admin_id)
}else{
    console.log(req.session.admin_id)
    res.send("<script>alert('Invalid Details'); history.back();</script>")
}
// res.send(req.body)
})    

    function checkadminlogin(req,res,next) {
    if(req.session.admin_id === undefined) {
        res.redirect('/admin/admin_login');
    } else {
        next();
    }
    }


router.get("/",checkadminlogin, function (req, res) {
res.render("admin/home.ejs");
});
router.get("/user_tbl",async function(req,res)
{
    var user_info = await exe(`SELECT * FROM user_tbl`);
    var obj ={"user_info":user_info}
    res.render("admin/user_info.ejs",obj)
})


router.get("/user_delete/:id",async function(req,res)
{
    var sql = `DELETE FROM user_tbl WHERE user_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/user_tbl")
});

router.get("/manage_banner",checkadminlogin,async function(req,res)
{
     var banner_info = await exe("SELECT * FROM  banner");
     var obj = {"banner_info":banner_info,
     "is_login" : ((req.session.admin_id) ? true:false)
               }
    res.render("admin/manage_banner.ejs",obj);
});
router.post("/save_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/manage_banner");
});
//product start
router.get("/product_type",checkadminlogin,async function(req,res)
{
    var types = await exe("SELECT * FROM product_type");
    var obj = {"types":types,
    "is_login" : ((req.session.admin_id) ? true:false)};
    res.render("admin/product_type.ejs",obj);
});
router.post("/save_product_type",async function(req,res)
{
    // var sql =`CREATE TABLE product_type (product_type_id INT PRIMARY KEY
    //      AUTO_INCREMENT, product_type_name VARCHAR(200))`;
     var sql =`INSERT INTO product_type (product_type_name) VALUES ('${req.body.product_type_name}')`;
        var data =await exe(sql);

    // res.send(data);
    res.redirect("/admin/product_type");
});
router.get("/delete_list/:id",async function(req,res)
{
    var sql = `DELETE FROM product_type WHERE product_type_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/product_type")
});
router.get("/edit_list/:id",checkadminlogin,async function(req,res)
{
    var id = req.params.id;
    var data =await exe(`SELECT * FROM product_type WHERE product_type_id = '${id}'`);
    var obj = {"product_e":data[0],
    "is_login" : ((req.session.admin_id) ? true:false)
}
    res.render("admin/edit_product.ejs",obj);
    
});
router.post("/update_product_type",async function(req,res)
{
    var sql =`UPDATE product_type SET product_type_name = '${req.body.product_type_name}' WHERE product_type_id = '${req.body.product_type_id}'`;    
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/product_type");
});     
router.get("/product",checkadminlogin,async function(req,res)
{
    var types =await exe("SELECT * FROM product_type");
     var obj = {"types":types,
     "is_login" : ((req.session.admin_id) ? true:false)};
    res.render("admin/product.ejs",obj);
});
router.post("/save_product",async function(req,res)
{
    if(req.files.product_image[0])
    {
     var file_names = [];
     console.log("Multiple Image Upload");
     for(var i=0;i<req.files.product_image.length;i++)
     {
       var fn  = new Date().getTime() + req.files.product_image[i].name;
       req.files.product_image[i].mv("public/uploads/"+fn);
       file_names.push(fn);
     }
     var file_name = file_names.join(",")
    }
    else{
 
     var file_name = new Date().getTime()+req.files.product_image.name;
     req.files.product_image.mv("public/uploads/"+file_name);
    }
     var d = req.body;
     d.product_details= d.product_details.replaceAll("'","`");
     var sql = `INSERT INTO  product (product_type_id ,product_name,product_price, 
        duplicate_price,product_size,product_color,product_label,product_details ,product_image) VALUES
         ('${d.product_type}','${d.product_name}','${d.product_price}','${d.duplicate_price}','${d.product_size}',
         '${d.product_color}','${d.product_label}','${d.product_details}','${file_name}')`;
    var data = await exe(sql);
    //  res.send(data);
    res.redirect("/admin/product");
});
router.get("/product_list",checkadminlogin,async function(req,res)
{
    var products = await exe("SELECT * FROM product,product_type WHERE product.product_type_id = product_type.product_type_id");
    var obj = {"products":products,
    "is_login" : ((req.session.admin_id) ? true:false)};
  res.render("admin/product_list.ejs",obj)
});
router.get("/product_search",checkadminlogin,async function(req,res)
{
    var url_data = url.parse(req.url,true).query;
    var str = url_data.str;
    var sql = `SELECT * FROM product,product_type WHERE product.product_type_id 
    = product_type.product_type_id AND
     ( product_name LIKE '%${str}%' OR product_type_name LIKE '%${str}%' OR product_size LIKE '%${str}%'
      OR product_price LIKE '%${str}%' OR duplicate_price LIKE '%${str}%' OR product_label LIKE '%${str}%' OR product_details LIKE '%${str}%' )`;
  var products =  await exe(sql);
  var obj = {"products":products,
  "is_login" : ((req.session.admin_id) ? true:false)};
  res.render("admin/product_list.ejs",obj)
  
});
router.get("/product_delete/:id",async function(req,res)
{
    var sql = `DELETE FROM product WHERE product_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/product_list")
});
router.get("/product_edit/:id",checkadminlogin,async function(req,res)
{
    var types =await exe("SELECT * FROM product_type");
    var product_info = await exe(`SELECT * FROM product WHERE product_id='${req.params.id}'`);
    var obj = {"types":types,"product_info":product_info[0],
    "is_login" : ((req.session.admin_id) ? true:false)};
    res.render("admin/product_edit.ejs",obj)
});
router.get("/delete_product_image/:id/:img",async function(req,res)
{
 var data = await exe(`SELECT * FROM product WHERE product_id = '${req.params.id}'`);
 new_image = data[0]['product_image'].replaceAll(req.params.img,"");
 var sql = `UPDATE product SET product_image = '${new_image}' WHERE product_id = '${req.params.id}'`;
 var data = await exe(sql);
//  res.send(data)
 res.redirect("/admin/product_list");
});
router.post("/update_product",async function(req,res)
{
    var d = req.body;
    if(req.files)
    {
        if(req.files.product_image[0])
        {
         var file_names = [];
         console.log("Multiple Image Upload");
         for(var i=0;i<req.files.product_image.length;i++)
         {
           var fn  = new Date().getTime() + req.files.product_image[i].name;
           req.files.product_image[i].mv("public/uploads/"+fn);
           file_names.push(fn);
         }
         var file_name = file_names.join(",")
        }
        else{
     
         var file_name = new Date().getTime()+req.files.product_image.name;
         req.files.product_image.mv("public/uploads/"+file_name);
        }  

       var sql = `UPDATE product SET product_image='${file_name}' WHERE product_id = '${d.product_id}'`;
       var data = await exe(sql);

    }
    var sql = `UPDATE product SET product_name='${d.product_name}', product_price='${d.product_price}', 
    duplicate_price='${d.duplicate_price}', product_size='${d.product_size}', product_color='${d.product_color}',
     product_label='${d.product_label}', product_details='${d.product_details}' WHERE product_id = '${d.product_id}'`;
       var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/product_list")

});
//why_choose_us start
router.get("/why_choose_us",checkadminlogin,async function(req,res)
{
    var why_choose_us_info = await exe("SELECT * FROM  why_choose_us");
     var obj = {"why_choose_us_info":why_choose_us_info,
     "is_login" : ((req.session.admin_id) ? true:false)};
    res.render("admin/why_choose_us.ejs",obj);
});

router.post("/save_why_choose_us",async function(req,res)
{
    if(req.files)
    {
        var why_choose_image = new Date().getTime() + req.files.why_choose_image.name;
        req.files.why_choose_image.mv("public/uploads/"+why_choose_image)

       var d = req.body;
       var sql =`UPDATE why_choose_us SET why_choose_title='${d.why_choose_title}',
       why_choose_image = '${why_choose_image}' WHERE why_choose_id = 1`;
       var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql =`UPDATE why_choose_us SET why_choose_title='${d.why_choose_title}' WHERE why_choose_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/why_choose_us");
});
//Why Chhoes US End
//key_points start
router.get("/key_points",checkadminlogin,function(req,res)
{  
    var obj ={
        "is_login" : ((req.session.admin_id) ? true:false)
    };
    res.render("admin/key_point.ejs",obj);
});

router.post("/save_key_point",async function(req,res)
{
    var d = req.body;

    if(req.files)
    {  
    var key_point_image = new Date().getTime()+req.files.key_point_image.name;
    req.files.key_point_image.mv("public/uploads/"+key_point_image);
    
    var sql = `INSERT INTO key_point(key_point_image,why_choose_headnig,why_choose_details)
     VALUES ('${key_point_image}','${d.why_choose_headnig}', '${d.why_choose_details}')`;
    }
    else{
    // var d = req.body;
    var sql = `INSERT INTO key_point (why_choose_headnig,why_choose_details) 
    VALUES ('${d.why_choose_headnig}', '${d.why_choose_details}')`;
    }
    var data = await exe(sql);
    res.redirect("/admin/key_points");
 
 });
 router.get("/key_points_list",checkadminlogin,async function(req,res)
 {
    var key_point_info = await exe("SELECT * FROM key_point");
        var obj = {"key_point_info":key_point_info,
        "is_login" : ((req.session.admin_id) ? true:false)
    };
    res.render("admin/key_points_list.ejs",obj);
 });
 
 router.get("/key_point_edit/:id",checkadminlogin,async function(req,res)
 {
    var id = req.params.id;
    var data =await exe(`SELECT * FROM key_point WHERE key_point_id = '${id}'`);
    var obj = {"key_point_info":data,
    "is_login" : ((req.session.admin_id) ? true:false)
}
     res.render("admin/key_point_edit.ejs",obj)
 });

 router.post("/update_key_point",async function(req,res)
{
    var d = req.body;
    if (req.files != null){

        {
            if (req.files.key_point_image != undefined) {
                var image = new Date().getTime() + req.files.key_point_image.name;
                req.files.key_point_image.mv("public/uploads/" + image);
                var sql = `UPDATE key_point SET key_point_image='${image}' WHERE key_point_id = '${d.key_point_id}'`;
                var data= await exe(sql);
            }
            // console.log(data);
        }
    }
    var sql =` UPDATE key_point SET why_choose_headnig='${d.why_choose_headnig}', why_choose_details= '${d.why_choose_details}' WHERE key_point_id = '${d.key_point_id}'`;
    await exe(sql);
    // res.send(data);
    res.redirect("/admin/key_points_list");
});
router.get("/key_point_delete/:id",async function(req,res)
{
    var sql = `DELETE FROM key_point WHERE key_point_id = '${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/key_points_list");
});
//key_points end

//Modern Interior Design Start
router.get("/modern_interior",checkadminlogin,async function(req,res)
{
    var details= await exe(`select * from modern_interior`);
    var obj = {"details":details[0],
    "is_login" : ((req.session.admin_id) ? true:false)
};
    res.render("admin/modern_interior.ejs",obj);
});

router.post("/update_modern_interior",async function(req,res)
{
    var d=req.body;
    if(req.files)
    {
        if(req.files.modern_img1 !=undefined)
        {
            var img1=new Date().getTime()+req.files.modern_img1.name;
            req.files.modern_img1.mv("public/uploads/"+img1);
            await exe(`update  modern_interior set  modern_img1='${img1}' where modern_interior_id=1`)
        }
        if(req.files.modern_img2 !=undefined)
        {
            var img2=new Date().getTime()+req.files.modern_img2.name;
            req.files.modern_img2.mv("public/uploads/"+img2);
            await exe(`update  modern_interior set  modern_img2='${img2}' where modern_interior_id=1`)

        }
        if(req.files.modern_img3 !=undefined)
        {
            var img3=new Date().getTime()+req.files.modern_img3.name;
            req.files.modern_img3.mv("public/uploads/"+img3);
            await exe(`update  modern_interior set   modern_img3='${img3}' where modern_interior_id=1`)

        }
    }
    var sql=`update modern_interior set
     modern_key1='${d.modern_key1}',
     modern_key2='${d.modern_key2}',
     modern_key3='${d.modern_key3}',
     modern_key4='${d.modern_key4}',
     modern_heading='${d.modern_heading}',
     modern_detail='${d.modern_detail}'
     where modern_interior_id=1 `;

     var data=await exe(sql);
    //   res.send(data);
    res.redirect("/admin/modern_interior");
});
//Modern Interior Design End

// testimonials Start
router.get("/testimonials",checkadminlogin,async function(req,res)
{
    var sql =`SELECT * FROM  testimonials`;
    var data = await exe(sql);
    var obj = { "test_data":data,
    "is_login" : ((req.session.admin_id) ? true:false)
};

     res.render("admin/testimonials.ejs",obj);
});
router.post("/save_testimonials", async function (req, res)
{
    var d = req.body;
    if(req.files)
    {
        var customer_photo = new Date().getTime() + req.files.customer_photo.name;
        req.files.customer_photo.mv("public/uploads/" + customer_photo);
         d.customer_message = d.customer_message.replaceAll(".", ".");
        var sql = `INSERT INTO testimonials(customer_photo ,customer_name ,customer_position , customer_message) 
        VALUES ('${customer_photo}','${d.customer_name}','${d.customer_position}','${d.customer_message}')`;
    }
    else{
        d.customer_message = d.customer_message.replaceAll(".", ".");
        var sql = `INSERT INTO testimonials(customer_name ,customer_position , customer_message) 
        VALUES ('${d.customer_name}','${d.customer_position}','${d.customer_message}')`;
    }
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/testimonials");
});

router.get("/delete_testimonials/:id", async function (req, res) {
    var sql =`DELETE FROM testimonials WHERE testimonial_id='${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/testimonials");
});
router.get("/edit_testimonials/:id",checkadminlogin, async function (req, res) {
    var sql =` SELECT * FROM testimonials WHERE testimonial_id='${req.params.id}'`;
    var data = await exe(sql);
    var obj = { "testmonial_data": data,
    "is_login" : ((req.session.admin_id) ? true:false)
}
    res.render("admin/edit_testemonial.ejs",obj);
});
router.post("/update_testimonials", async function (req, res) {
    var d = req.body;
    if (req.files != null) {
        if (req.files.customer_photo != undefined) {
            var customer_photo = new Date().getTime() + req.files.customer_photo.name;
            req.files.customer_photo.mv("public/uploads/" + customer_photo);
            var sql = `UPDATE testimonials SET customer_photo='${customer_photo}' WHERE testimonial_id='${req.body.testimonial_id}'`;
            var data = await exe(sql);

        }
    }
    var sql =`UPDATE testimonials SET customer_name='${d.customer_name}' ,customer_position='${d.customer_position}' ,customer_message='${d.customer_message}' WHERE testimonial_id='${req.body.testimonial_id}'`;
    await exe(sql);
    // res.send(req.body);
    res.redirect("/admin/testimonials");
});

// Blog Start
router.get("/blog",checkadminlogin,async function(req,res)
{
    var sql=`SELECT * FROM blog`;
    var data= await exe(sql);
    var obj={"blog_data":data,
    "is_login" : ((req.session.admin_id) ? true:false)
};
    res.render("admin/blog.ejs",obj);
})
router.post("/save_blog", async function (req, res) 
    {
        var d = req.body;
        if(req.files)
        {
            var blog_image = new Date().getTime() + req.files.blog_image.name;
            req.files.blog_image.mv("public/uploads/" + blog_image);
            var sql =` INSERT INTO blog(blog_image,blog_title,blog_details,blog_post_date,blog_post_time,blog_post_by,blog_post_by_position) VALUES 
            ('${blog_image}','${d.blog_title}','${d.blog_details}','${d.blog_post_date}','${d.blog_post_time}','${d.blog_post_by}','${d.blog_post_by_position}')`;
        }
        else{
            var sql =`INSERT INTO blog(blog_image,blog_title,blog_details,blog_post_date,blog_post_time,blog_post_by,blog_post_by_position) VALUES 
            ('${blog_image}','${d.blog_title}','${d.blog_details}','${d.blog_post_date}','${d.blog_post_time}','${d.blog_post_by}','${d.blog_post_by_position}')`;
           
        }
      
        var data= await exe(sql);
        // res.send(data);
        res.redirect("/admin/blog");
    });
router.get("/edit_blogs/:id",checkadminlogin,async function(req,res)
{
        var sql=`SELECT * FROM blog WHERE blog_id='${req.params.id}'`;
        var data= await exe(sql);
        var obj={"edit_blog":data,
        "is_login" : ((req.session.admin_id) ? true:false)
    };
        res.render("admin/edit_blog.ejs",obj);
});
router.post("/update_blog",async function(req,res){
    var d= req.body;
    if(req.files!=null){
        if(req.files.blog_image!=undefined){
            var blog_image= new Date().getTime()+req.files.blog_image.name;
            req.files.blog_image.mv("public/uploads/"+blog_image);
            var sql=`UPDATE blog SET blog_image='${blog_image}' WHERE blog_id='${req.body.blog_id}'`;
            var data= await exe(sql);
        }
        console.log(data);
    }
    var sql=`UPDATE blog SET blog_title='${d.blog_title}',blog_details='${d.blog_details}',
    blog_post_date='${d.blog_post_date}',blog_post_time='${d.blog_post_time}',blog_post_by='${d.blog_post_by}',
    blog_post_by_position='${d.blog_post_by_position}'WHERE blog_id='${d.blog_id}' `;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/blog");
});
router.get("/delete_blogs/:id",async function(req,res){
    var sql=`DELETE FROM blog WHERE blog_id='${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/blog");
});
// Blog End

// Shop Page Start
router.get("/shop",checkadminlogin,async function(req,res)
{
    var shop_banner = await exe("SELECT * FROM  shop_banner");
     var obj = {"shop_banner":shop_banner,
     "is_login" : ((req.session.admin_id) ? true:false)
    };
    res.render("admin/shop_page.ejs",obj);
});
router.post("/Shop_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE shop_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE shop_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/shop");
});



// About Page Start
router.get("/about_us_banner",checkadminlogin,async function(req,res)
{
    var aboutus_banner = await exe("SELECT * FROM  aboutus_banner");
     var obj = {"aboutus_banner":aboutus_banner,
     "is_login" : ((req.session.admin_id) ? true:false)
    };
    res.render("admin/aboutus_banner.ejs",obj);
});
router.post("/about_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE aboutus_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE aboutus_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/about_us_banner");
});

// About Team
router.get("/about_team",checkadminlogin,async function(req,res)
{
    var sql =`SELECT * FROM  about_team`;
    var about_team = await exe(sql);
    var obj = {"about_team":about_team,
    "is_login" : ((req.session.admin_id) ? true:false)
};
    res.render("admin/about_team.ejs")
});
router.post("/save_employee",async function (req, res)
{
    var d = req.body;
    if(req.files)
    {
        var employee_photo = new Date().getTime() + req.files.employee_photo.name;
        req.files.employee_photo.mv("public/uploads/" + employee_photo);
         d.employee_details = d.employee_details.replaceAll(".", ".");
        var sql = `INSERT INTO about_team(employee_photo, employee_name, employee_position, employee_details) 
        VALUES ('${employee_photo}','${d.employee_name}','${d.employee_position}','${d.employee_details}')`;
    }
    else{
        d.employee_details = d.employee_details.replaceAll(".", ".");
        var sql = `INSERT INTO about_team(employee_name ,employee_position , employee_details) 
        VALUES ('${d.employee_name}','${d.employee_position}','${d.employee_details}')`;
    }
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/about_team");
});
router.get("/team_list",checkadminlogin,async function(req,res)
{
    var about_team = await exe("SELECT * FROM  about_team");
    var obj = {"about_team":about_team,
    "is_login" : ((req.session.admin_id) ? true:false)
};
    res.render("admin/team_list.ejs",obj)
});


router.get("/edit_about_team/:id",checkadminlogin, async function (req, res) {
    var sql =` SELECT * FROM about_team WHERE about_team_id='${req.params.id}'`;
    var data = await exe(sql);
    var obj = { "about_team": data,
    "is_login" : ((req.session.admin_id) ? true:false)
};
    res.render("admin/edit_about_team.ejs",obj);
});


router.post("/update_team", async function (req, res) {
    var d = req.body;
    if (req.files != null) {
        if (req.files.employee_photo != undefined) {
            var employee_photo = new Date().getTime() + req.files.employee_photo.name;
            req.files.employee_photo.mv("public/uploads/" + employee_photo);
            var sql = `UPDATE about_team SET employee_photo='${employee_photo}' WHERE about_team_id='${req.body.about_team_id}'`;
            var data = await exe(sql);

        }
    }
    var sql =`UPDATE about_team SET employee_name='${d.employee_name}' ,employee_position='${d.employee_position}' ,employee_details='${d.employee_details}' WHERE about_team_id='${req.body.about_team_id}'`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/admin/team_list");
});
router.get("/delete_about_team/:id",async function(req,res){
    var sql=`DELETE FROM about_team WHERE about_team_id='${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/team_list");
});

// services start
router.get("/services",checkadminlogin,async function(req,res)
{ 
    var services_banner = await exe("SELECT * FROM  services_banner");
    var obj = {"services_banner":services_banner,
    "is_login" : ((req.session.admin_id) ? true:false)
}
    res.render("admin/services_banner.ejs",obj);
});
router.post("/services_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE services_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE services_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/services");
});

// Blog
router.get("/blogpage",checkadminlogin,async function(req,res)
{
    var blog_banner = await exe("SELECT * FROM  blog_banner");
    var obj = {"blog_banner":blog_banner,
    "is_login" : ((req.session.admin_id) ? true:false)

}
    res.render("admin/blog_banner.ejs",obj);
});
router.post("/blog_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE blog_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE blog_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/blogpage");
});
// contact Start

router.get("/contact_banner",checkadminlogin,async function(req,res)
{
    var contact_banner = await exe("SELECT * FROM  contact_banner");
    var obj = {"contact_banner":contact_banner,
    "is_login" : ((req.session.admin_id) ? true:false)
}
    res.render("admin/contact_banner.ejs",obj);
});
router.post("/contact_banner",async function(req,res)

{ 
    if(req.files)
    {
        var banner_image = new Date().getTime() + req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image)

    var d = req.body;
    var sql = `UPDATE contact_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
    banner_link = '${d.banner_link}',banner_image = '${banner_image}' WHERE banner_id = 1`;
    var data  =  await exe (sql);
    }
    else
    {
        var d = req.body;
        var sql = `UPDATE contact_banner SET banner_title='${d.banner_title}',banner_details = '${d.banner_details}',
        banner_link = '${d.banner_link}' WHERE banner_id = 1`;
        var data  =  await exe (sql);  
    }
    // res.send(data);
    res.redirect("/admin/contact_banner");
});


router.get("/contact_form_list",checkadminlogin,async function(req,res){

    var from_info = await exe("SELECT * FROM contact_from");
     var obj = { "from_info": from_info,
     "is_login" : ((req.session.admin_id) ? true:false)
    };
     
     res.render("admin/contact_form_list.ejs",obj);
 
 });

 router.get("/delete_from/:id",async function(req,res){
    var sql=`DELETE FROM contact_from WHERE contact_from_id='${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/contact_form_list");
});

router.get("/edit_from/:id",checkadminlogin,async function (req, res) {
    var sql =` SELECT * FROM contact_from WHERE contact_from_id ='${req.params.id}'`;
    var data = await exe(sql);
    var obj = { "contact_from": data,
    "is_login" : ((req.session.admin_id) ? true:false)
}
    res.render("admin/edit_contact_from.ejs",obj);
});
router.post("/update_from",async function(req,res)
{
    
    var d = req.body;
    var sql = `UPDATE contact_from  SET  fname= '${d.fname}', lname = '${d.lname}', email = '${d.email}', message = '${d.message}'  WHERE contact_from_id  = '${d.contact_from_id }' `;
    var data = await exe(sql);
    res.redirect("/admin/contact_form_list");
    // res.send(data);
});

router.get("/pending_order",checkadminlogin,async function(req,res)
 {
    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM  order_products WHERE
     order_products.order_id = order_tbl.order_id)  as ttl_amt FROM  order_tbl WHERE  order_status  = 'pending'`;
    var obj = {
        "is_login" : ((req.session.admin_id) ? true:false),
        "orders": await exe(sql),
        
    };
    res.render("admin/pending_order.ejs",obj);
 });

 router.get("/view_order/:id",checkadminlogin,async function(req,res)
 {
    var data = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);

    var products = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
    var obj = {"order_info":data[0],
                "products":products,
                "is_login" : ((req.session.admin_id) ? true:false)

              };
    // res.send(data);
   res.render("admin/view_order.ejs",obj);
});


router.get("/dispatch_order/:id",async function(req,res){
     
  var today = new Date().toISOString().slice(0,10);
  var sql = `UPDATE order_tbl SET  order_dispatch_date = '${today}',order_status = 'dispatch'  WHERE order_id = '${req.params.id}'`;
  var data = await exe(sql);
//   res.send(data); 
   res.redirect("/admin/pending_order")
});


router.get("/dispatch_order",checkadminlogin,async function(req,res)
{
    var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM  order_products WHERE
     order_products.order_id = order_tbl.order_id)  as ttl_amt FROM  order_tbl WHERE  order_status  = 'dispatch'`;
    var obj = {
    "is_login" : ((req.session.admin_id) ? true:false),
         
        "orders": await exe(sql)
    };
    res.render("admin/dispatch_order.ejs",obj);
 });


 router.get("/view_dispatch_order/:id",checkadminlogin,async function(req,res)
 {
    var data = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);

    var products = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
    var obj = {"order_info":data[0],
                "products":products,
    "is_login" : ((req.session.admin_id) ? true:false)

              };
   res.render("admin/view_dispatch_order.ejs",obj);
});

router.get("/delivered_order/:id",async function(req,res){
     
    var today = new Date().toISOString().slice(0,10);
    var sql = `UPDATE order_tbl SET order_delivered_date = '${today}',order_status = 'delivered'  WHERE order_id ='${req.params.id}'`;
    var data = await exe(sql);
    // res.send(data); 
     res.redirect("/admin/dispatch_order")
  });

  router.get("/delivered_order",checkadminlogin,async function(req,res)
  {
      var sql = `SELECT *,(SELECT SUM(product_qty*product_price) FROM  order_products WHERE
       order_products.order_id = order_tbl.order_id)  as ttl_amt FROM  order_tbl WHERE  order_status  = 'delivered'`;
      var obj = {
          "is_login" : ((req.session.admin_id) ? true:false),
           
          "orders": await exe(sql)
      };
      res.render("admin/delivered_order.ejs",obj);
   });
  

router.get("/view_deliverd_order/:id",checkadminlogin,async function(req,res)
   {
      var data = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);
  
      var products = await exe(`SELECT * FROM order_products WHERE order_id = '${req.params.id}'`);
      var obj = {"order_info":data[0],
                  "products":products,
                  "is_login" : ((req.session.admin_id) ? true:false)

                };
     res.render("admin/view_delivered_order.ejs",obj);
  });
router.get("/admin_logout",function(req,res){
    res.redirect("/admin/admin_login")
})
module.exports = router;
