//** IMPORT DEPENDENCIES 
const process=require("process");
const formidable = require('express-formidable');
const globalSettings=require("../global-modules/sys-settings/config/config.json");
const express = require('express');
const userToken=require('@oi/account/lib/token'); 

const countries=require('@oi/utilities/lib/lists/countries.json');
const specialties=require('@oi/utilities/lib/lists/medical-specialties.json');

//const parser=require('body-parser');

//*** INTIALIZATIONS  */
// const account=new iAccount();
const app = express();
const port=8081;
const os=process.platform;
const globalFsPath=globalSettings.globalFs[os];

//** LOCAL ASSIGNEMENTS */
app.locals.sysSettings=globalSettings;
app.locals.globalFsPath=globalFsPath;

//** ASSIGN MIDDLEWARES */
app.use('/src',express.static('src'));
app.use('/gfs',express.static(globalFsPath));
app.use('/node_modules',express.static('node_modules'));
app.use(formidable());
// app.use(session({secret:'secretkey',saveUninitialized:true,resave:true,cookie:{maxAge:60000,domain:'locahost'}}));

//** SET ENGINES */
app.set('view engine', 'ejs');

//** SET GLOBAL ROUTES */
const globalRoutes=require(globalFsPath+'/routes')(app);
const paymentRoutes=require(globalFsPath+'/payment/routes')(app);
const accountRoutes=require(globalFsPath+'/account/routes')(app);

//** MIDDLEWARE USER LOGIN */
app.use('/',async function(req,res,next){

    try {
        //console.log(req);
        //-- get the user info from token ---
        app.locals.user_info=await userToken.verifyToken(req,res);//checks if user token is set

        //-- get countries --
        app.locals.user_info.country_dial_code=countries.filter(c=>c._id===app.locals.user_info.country_code)[0].dial_code;
        app.locals.user_info.specialty=specialties.filter(s=>s._id===app.locals.user_info.specialty)[0];

        //if token is expired or token is not valid redirect user to login screen
        if(Object.keys(app.locals.user_info).length===0){
            let param=encodeURIComponent(`${req.headers.host}${req.path}`);
            res.redirect(`${globalSettings.website}/login?goto=${param}`);
        }

        next();
        
    } catch (error) {
        console.log(error);
    }
    

});

app.get('/summary',(req,res)=>{
    res.render(`pages/summary/${app.locals.user_info.user_type}`);
});

app.get('/enroll/:accounttype/:accountid',(req,res)=>{

    let accounttype = req.params.accounttype.toLowerCase(); 
    let accountid = req.params.accountid.toLowerCase(); 

    switch (accounttype) {
        case 'healthcare_provider':
            //get the provider information using the account id
            res.render(`pages/enrollment/healthcare-provider`);
            break;
        
        case 'healthcare_facility':
                break;
        default:
            break;
    }
});



app.listen(port,console.log("listening port "+port));


// app.get('/',(req,res)=>{
//     res.render('pages/qualification');
// });

// app.get('/profile',(req,res)=>{
//     res.render('pages/profile');
// });

// app.get('/payment',(req,res)=>{
//     res.render('pages/payment');
// });

// app.get('/reset-passw',(req,res)=>{
//     res.render('pages/reset-passw');
// });