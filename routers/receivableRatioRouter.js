const Router = require("koa-router");
const querystring = require("querystring");
let getData = require('./common');

let router = new Router({
    prefix:"/ReceivableRatio"
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
        auth = await getData(authUrl, postData1);
    } else {
        // console.log("second");
        auth = [{
            'AUTH_TYPE': '0',
            'AUTH_ID': authid
        }];
    }
    // console.log("auth");
    // console.log(auth);
    
    await ctx.render('ReceivableRatio/index.pug',{auth});
    
});

router.get('/getData', async (ctx) => {
    // console.log("getData");
    // console.log(ctx.query);
    let {nowTime, authType, authID} = ctx.query;
    let postData = querystring.stringify({
        'authType': authType,
        'authID': authID,
        'getType': 'now',
        'season': nowTime
    });
    let postData1 = querystring.stringify({
        'authType': authType,
        'authID': authID,
        'getType': 'lastMonth',
        'season': nowTime
    });
    const getDataUrl = 'receiveRatio/getByHat.jsp';
    let nowData = await getData(getDataUrl, postData);
    console.log(postData);
    let lastMonthData = await getData(getDataUrl, postData1);
    console.log(lastMonthData);

    // let data = {
    //     name: 'claire'
    // }
    ctx.body = {nowData,lastMonthData};
});

router.get('/getData/client', async (ctx) => {
    // console.log("getData");
    // console.log(ctx.query);
    let {nowTime, authType, authID} = ctx.query;
    let postData = querystring.stringify({
        'authID': authID,
        'season': nowTime
    });
    const getDataUrl = 'receiveRatio/getClientDataByAuth.jsp';
    let data = await getData(getDataUrl, postData);
    console.log(data);
    ctx.body = {data};
});

router.get('/detail', async (ctx) => {
    // console.log("==========================detail");
    // console.log(ctx.query);
    let hatid = ctx.query.companyid;
    await ctx.render('ReceivableRatio/detail.pug',{hatid});
});

router.get('/getData/detail', async ctx => {
    // console.log('/getData/detail');
    // console.log(ctx.query);
    let {type, nowTime, hatid} = ctx.query;
    let getDataUrl = "";
    if(type === "client") {
        getDataUrl = 'receiveRatio/getClientData.jsp';
    } else if (type === "dept") {
        getDataUrl = 'receiveRatio/getDeptData.jsp';
    }
    let postData = querystring.stringify({
        'hatID': hatid,
        'getType': 'now',
        'season': nowTime
    });
    let postData1 = querystring.stringify({
        'hatID': hatid,
        'getType': 'lastMonth',
        'season': nowTime
    });
    if(type === "client") {
        let data = await getData(getDataUrl, postData);
        console.log(data);
        ctx.body = {data};
    } else if (type === "dept") {
        let nowData = await getData(getDataUrl, postData);
        // console.log(nowData);
        // console.log("+++++++++++++++++++++++++++++++++++++++++");
        let lastMonthData = await getData(getDataUrl, postData1);
        console.log(lastMonthData);
        ctx.body = {nowData,lastMonthData};
    }
});

module.exports = router;