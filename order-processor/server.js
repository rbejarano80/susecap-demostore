var redis=require('redis');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL;

var vcap_services = JSON.parse(process.env.VCAP_SERVICES);
var uri = vcap_services.redis[0].credentials.uri;
var client = redis.createClient(uri);

var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};

app.use(bodyParser.json());
app.options('*', cors(corsOptions));
//app.use(cors(corsOptions));

app.listen(process.env.VCAP_APP_PORT ||8001, function () {
    console.log ("Server started!");
    reset();
});


app.post('/api/order', cors(), (req, res, next) => {

    console.log(req.body);
    client.hincrby("orders", "count", 1);
    client.hincrby("orders", "total", req.body.price);
    res.status('201').send(req.body);
})


app.get('/api/sales', (req, res) => {
    client.HGETALL("orders", (err, value) => {
        res.json(value);
    });
});

app.get('/api/reset', (req, res) => {
    reset();
    res.send("Done!");
});

var reset = function () {
    client.HMSET("orders",{"count": 0, "total": 0});
}
