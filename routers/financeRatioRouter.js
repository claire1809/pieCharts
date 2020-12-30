const Router = require("koa-router");
const querystring = require("querystring");
let getData = require('./common');

let router = new Router({
    prefix:"/FinanceReceiveRatio"
});

router.get('/',async (ctx)=>{
    // console.log(ctx.query.id);
    let {id, userid, authid} = ctx.query;
    let auth = {};
    // console.log("authid",authid);
    // console.log(typeof(authid))
    if(typeof(authid) == "undefined") {
        // console.log("first");
        const authUrl = 'getUserAuth.jsp';
        const postData1 = querystring.stringify({
            'userid' : userid,
            'menuID' : id
        });
        // console.log(postData1);
        auth = await getData(authUrl, postData1, true);
    } else {
        // console.log("second");
        auth = [{
            'AUTH_TYPE': '0',
            'AUTH_ID': authid
        }];
    }
    // console.log("auth");
    // console.log(auth);
    
    await ctx.render('FinanceReceiveRatio/index.pug',{auth});
    
});

router.get('/getData', async (ctx) => {
    // console.log("getData");
    // console.log(ctx.query);
    let {authType, authID} = ctx.query;
    let postData = querystring.stringify({
        'authType': authType,
        'authID': authID,
        'getType': 'now'
    });
    let postData1 = querystring.stringify({
        'authType': authType,
        'authID': authID,
        'getType': 'lastMonth'
    });
    const getDataUrl = 'financeReceiveRatio/getByHat.jsp';
    let nowData = await getData(getDataUrl, postData, true);
    // console.log(postData);
    let lastMonthData = await getData(getDataUrl, postData1, true);
    // console.log(lastMonthData);

    // let data = {
    //     name: 'claire'
    // }
    ctx.body = {nowData,lastMonthData};
});


module.exports = router;