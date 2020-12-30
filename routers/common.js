const http = require('http');

const requestUriTest = 'http://oatest.bluefocusgroup.com:8089/mobile/plugin/jsp/chart/';//测试
// const requestUri = 'http://oatest.bluefocusgroup.com:8089/mobile/plugin/jsp/chart/';//测试
const requestUri = 'http://oa.bluefocusgroup.com:8088/mobile/plugin/jsp/chart/';//正式

function getData(urlString, postData, test) {
    return new Promise((resolve, rejects) => {
        let uri = requestUri;
        // console.log(test);
        if(test === true) {
            uri = requestUriTest;
        }
        // console.log(uri);
        const url = uri + urlString;
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

module.exports = getData;
