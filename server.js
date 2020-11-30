const Koa = require("koa");
const Router = require("koa-router");
const querystring = require("querystring");
const http = require('http');
const https = require('https');
const views = require("koa-views");
const static = require("koa-static");
const { resolve } = require("path");
const { rejects } = require("assert");
// var iconv = require('iconv-lite');




const corpid = 'wx44673e3489d0f215';
const corpsecret = 'nu2uk2ylWLS-341eD2xUBg0dqlePBpORJtFfQglxykA';
// const requestUri = 'http://oatest.bluefocusgroup.com:8089/mobile/plugin/jsp/chart/';//测试
const requestUri = 'http://oa.bluefocusgroup.com:8088/mobile/plugin/jsp/chart/';//正式


let app = new Koa();
let router = new Router();

// /static --->locahost:8888
app.use(static(__dirname + "/static"));
app.use(views(__dirname + "/views",{
    // extension:"pug"
    map:{
        html:"pug"
    }
}));

router.get('/wechat/qy',async ctx => {
    // console.log(ctx.query.code);
    let code = ctx.query.code;
    // console.log('code=' + code);
    try {
        let token = await getAccessToken();
        let userid = await getUserInfo(token, code);
        ctx.redirect('/menu?userid=' + userid);
    } catch(error) {
        console.log('处理失败的promise：' + error);
        ctx.body = "出现异常！";
    }
});

router.get('/menu', async (ctx) => {
    const getMenuUrl = "getMenuInfo.jsp";
    let userid = ctx.query.userid;
    const postData = querystring.stringify({
        'userid' : userid
    });
    let menus = await getData(getMenuUrl, postData);
    if(menus.length === 0) {
        ctx.body = "请联系管理员开通权限！";
    } else {
        await ctx.render('menu.pug', {'userid':userid,menus});
    }
});

router.get('/ReceivableRatio',async (ctx)=>{
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
    
})

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

router.get('/ReceivableRatio/detail', async (ctx) => {
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
    
})








function getUserInfo(token, code) {
    return new Promise((resolve, rejects) => {
        // console.log('code=' + code);
        // console.log('token=' + token);
        let getUserInfoUrl = "https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=" + token + "&code=" + code;
        https.get(getUserInfoUrl, res => {
            // console.log(res.headers);
            // console.log('获取用户信息')
            let userData = "";
            res.on('data', chunck => {
                // console.log('getUserInfo-data方法');
                // console.log(chunck);
                // process.stdout.write(chunck);
                userData = JSON.parse(chunck);
                console.log(userData);
                
            });

            res.on('end', () => {
                if(userData['errcode'] === 0) {
                    userid = userData['UserId'];
                    resolve(userid);
                } else {
                    rejects();
                }
            });
        });
    });
}



function getData(urlString, postData) {
    return new Promise((resolve, rejects) => {
        const url = requestUri + urlString;
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }
        // console.log(url);
        let result = '';
        let req = http.request(url, options, (res) => {
            // // res.setEncoding('utf8');
            // console.log(res.headers);
            // console.log(res.chunck);
            res.on('data', chunck => {
                // console.log('getUserAuth-data方法');
                // console.log(JSON.parse(chunck));
                // console.log("chunck", chunck);
                result += chunck;
                // console.log("result", result);
            });

            res.on('end', () => {
                // console.log(result);
                result = JSON.parse(result);
                // process.stdout.write(chunck);
                // resData = JSON.parse(chunck);
                // console.log(result);
                resolve(result);
            })
        })
        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
            rejects("error");
        });
        req.write(postData);
        req.end();
    });
}

function getMenu(userid) {
    return new Promise((resolve, rejects) => {
        console.log("getMenu");
        const url = "http://oatest.bluefocusgroup.com:8089/mobile/plugin/jsp/chart/getMenuInfo.jsp";
        const postData = querystring.stringify({
            'userid' : userid
        });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }

        
        let menus = '';
        let req = http.request(url, options, (res) => {
            res.on('data', chunck => {
                // console.log('getUserAuth-data方法');
                // console.log(JSON.parse(chunck));
                menus = JSON.parse(chunck);
                // process.stdout.write(chunck);
                // resData = JSON.parse(chunck);
                // console.log(resData);
                resolve(menus);
            });

        })
        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
        });
        req.write(postData);
        req.end();
        
    })
}

function getUserAuth() {
    return new Promise((resolve, rejects) => {
        // console.log("getUserAuth");
        const url = "http://oatest.bluefocusgroup.com:8089/mobile/plugin/jsp/chart/getUserAuth.jsp";
        const postData = querystring.stringify({
            'userid' : userid
        });
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        }

        

        let req = http.request(url, options, (res) => {
            res.on('data', chunck => {
                // console.log('getUserAuth-data方法');
                // console.log(JSON.parse(chunck));
                // process.stdout.write(chunck);
                // resData = JSON.parse(chunck);
                // console.log(resData);
                resolve(JSON.parse(chunck));
            });

        })
        req.on('error', (e) => {
            console.error(`请求遇到问题: ${e.message}`);
        });
        req.write(postData);
        req.end();
    })
}




function getAccessToken() {
    return new Promise((resolve, rejects) => {
        let url = 'https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=' + corpid + '&corpsecret=' + corpsecret;
        let resData = "";
        https.get(url, res => {
            // console.log(res.headers);
            
            res.on('data', chunck => {
                console.log('getAccessToken-data方法');
                // console.log(chunck);
                // process.stdout.write(chunck);
                resData = JSON.parse(chunck);
                // console.log(resData);
                
            });

            res.on('end', () => {
                // console.log('getAccessToken-end方法');
                // console.log(resData);
                if(resData['errcode'] === 0) {
                    let token = resData['access_token'];
                    console.log('endtoken',token);
                    resolve(token);
                } else {
                    rejects(resData['errmsg']);
                }
            })
            
        });
    })
    
    // return resData;
}

app.use(router.routes());
 
app.listen(8888);