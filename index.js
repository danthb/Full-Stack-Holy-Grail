var express = require("express");
var app = express();

//TODO: create a redis client
var redis = require("redis");
var client = redis.createClient();

// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.mset("header", 0, "left", 0, "article", 0, "right", 0, "footer", 0);
client.mget(['header', 'left', 'article', 'right', 'footer'], function (err, reply) {
  console.log(reply);
});

// Get values for holy grail layout
function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  return new Promise(function (resolve, reject) {
    client.mget("header", "left", "right", "article", "footer",
      function (err, reply) {
        const data = {
          'header': Number(reply[0]),
          'left': Number(reply[1]),
          'article': Number(reply[2]),
          'right': Number(reply[3]),
          'footer': Number(reply[4])
        };
        err ? reject(err) : resolve(data);
    });
  });
}

// plus
app.get("/update/:key/:value", function (req, res) {


  //TODO: use the redis client to update the value associated with the given key
  const key = req.params.key;
  let value = Number(req.params.value);
  client.incrby(key, value, function (err, reply) {

    //new value
    value = Number(reply) + value;
    client.set(key, value);
    

    //return data to client
    data()
      .then(function (data) {
        console.log(data);
        res.send(data);
      })
      .catch(function (err) {
        console.log(err);
      });
    
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
