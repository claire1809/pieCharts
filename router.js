const receivableRatioRouter = require("./routers/receivableRatioRouter");
const financeRatioRouter = require("./routers/financeRatioRouter");
const mainRouter = require("./routers/mainRouter");
module.exports = function(app){
    app.use(receivableRatioRouter.routes());
    app.use(financeRatioRouter.routes());
    app.use(mainRouter.routes());
}