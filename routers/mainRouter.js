const Router = require("koa-router");
const https = require('https');
const querystring = require("querystring");
const corpid = 'wx44673e3489d0f215';
const corpsecret = 'nu2uk2ylWLS-341eD2xUBg0dqlePBpORJtFfQglxykA';

let getData = require('./common');
let router = new Router();
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

router.get('/log', async (ctx) => {
    let {userid, id} = ctx.query;
    getData("log.jsp", querystring.stringify({
        'userid' : userid,
        'menuID' : id
    }));
    ctx.response.body = ``;
});

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

module.exports = router;