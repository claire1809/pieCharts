const Koa = require("koa");
const views = require("koa-views");
const static = require("koa-static");

let app = new Koa();
const router = require("./router");

app.use(static(__dirname + "/static"));
app.use(views(__dirname + "/views",{
    // extension:"pug"
    map:{
        html:"pug"
    }
}));

router(app);
 
app.listen(8888);