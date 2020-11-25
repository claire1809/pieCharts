/**
 * 金额格式化
 * 以万为单位，保留2位小数
 * @param {金额} num 
 */
function formatMoney(num) {
    let money = Number((num / 10000).toFixedBfc(2));
    var regForm = /(\d{1,3})(?=(\d{3})+(?:$|\.))/g;//?:不作为分组捕获
    return money.toString().replace(regForm,"$1,") + "万";
    // return money.toLocaleString('zh', {
    //     // style: 'currency',
    //     // currency: "CNY",
    //     // notation: 'compact',
    //     // compactDisplay: 'short',
    //     // maximumFractionDigits: 2
    // }) + '万';
}

/**
 * 获取上升或下降符号
 * @param {当前金额} num1 
 * @param {上周或上月金额} num2 
 */
function getNotation(num1, num2) {
    let htmlStr = "";
    num1 = num1 * 1;
    num2 = num2 * 1;
    if(num1 < num2) {
        htmlStr = `<span class='flag flag-down'>↓</span>`;
    } else if (num1 > num2) {
        htmlStr = `<span class='flag flag-up'>↑</span>`;
    }
    return htmlStr;
}

//toFixed兼容方法，返回值为String类型！！！
Number.prototype.toFixedBfc = function(len){
    if(len>20 || len<0){
        throw new RangeError('toFixed() digits argument must be between 0 and 20');
    }
    if(typeof len === "undefined") {
        len = 2;
    }
    // console.log("toFixedBfc:",len)
    // .123转为0.123
    var number = Number(this);
    if (isNaN(number) || number >= Math.pow(10, 21)) {
        return number.toString();
    }
    if (typeof (len) == 'undefined' || len == 0) {
        return (Math.round(number)).toString();
    }
    var result = number.toString(),
        numberArr = result.split('.');

    if(numberArr.length<2){
        //整数的情况
        return padNum(result);
    }
    var intNum = numberArr[0], //整数部分
        deciNum = numberArr[1],//小数部分
        lastNum = deciNum.substr(len, 1);//最后一个数字
    
    if(deciNum.length == len){
        //需要截取的长度等于当前长度
        return result;
    }
    if(deciNum.length < len){
        //需要截取的长度大于当前长度 1.3.toFixed(2)
        return padNum(result)
    }
    //需要截取的长度小于当前长度，需要判断最后一位数字
    result = intNum + '.' + deciNum.substr(0, len);
    if(parseInt(lastNum, 10)>=5){
        //最后一位数字大于5，要进位
        var times = Math.pow(10, len); //需要放大的倍数
        var changedInt = Number(result.replace('.',''));//截取后转为整数
        changedInt++;//整数进位
        changedInt /= times;//整数转为小数，注：有可能还是整数
        result = padNum(changedInt+'');
    }
    return result;
    //对数字末尾加0
    function padNum(num){
        var dotPos = num.indexOf('.');
        if(dotPos === -1){
            //整数的情况
            num += '.';
            for(var i = 0;i<len;i++){
                num += '0';
            }
            return num;
        } else {
            //小数的情况
            var need = len - (num.length - dotPos - 1);
            for(var j = 0;j<need;j++){
                num += '0';
            }
            return num;
        }
    }
}