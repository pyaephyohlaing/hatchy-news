
var express = require('express');
var pg = require("pg");
var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
   });


/* In app.js we are using body-parser and we are telling our 
   Express application to use that plugin as well. */   
   const bodyParser = require('body-parser');

// parse application/json
app.use(bodyParser.json())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))


app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// app.get('/student/:id',  ( req,res,next )=>{
//     console.log("Hell Student::"+req.params.id);

//     res.send("Hell Student::"+req.query.name);

// } );

// function gg(req,res,next){

// }
// app.get('/gg',gg)

var connectionString = "postgres://root:rootroot@newflix.c0odzy31dw9l.us-east-1.rds.amazonaws.com:5432/newflix";

app.post('/test/submit', function(req, res, next) {
    var id = req.body.id;
    console.log(id);
});

function returnpost(id,response,user){
    pg.connect(connectionString,function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            response.status(400).send(err);
        } 
        console.log("returnpost")
    client.query('SELECT * FROM posts where user_id = $1', [id],function(err,result) {
        // done(); // closing the connection;
        if(err){
            console.log(err);
            response.status(400).send(err);
        }
        console.log("Select");
        console.log(result);
        console.log(result.rows);
        user.posts = result.rows;
        response.status(200)
        .json({
            user: user
        })
        
    });
    });
}   

app.post('/auth/user/login', (request, response, next) => {
    console.log("REQUEST BODY");
    console.log(request.body);
    console.log(request.body.name);
    console.log(request.body.email);
    console.log(request.body.google_uid);
    pg.connect(connectionString,function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            response.status(400).send(err);
        } 
        console.log("connected to database");
        console.log(request.body.google_uid);
        client.query("SELECT * FROM users where google_uid = $1", [request.body.google_uid], function(err,result){
            console.log("select query done");
            console.log(result);
            // done();
            if(result.rows.length == 0){
                console.log("enter if condition")
                client.query("INSERT INTO users(name, email, google_uid) values($1, $2, $3) returning id, name, email, google_uid",
                [request.body.name, request.body.email, request.body.google_uid], 
                // request.body),
                function(err,result) {
                    // done(); // closing the connection;
                    if(err){
                        console.log(err);
                        response.status(400).send(err);
                    }
                    console.log("result insert");
                    console.log(result);
                    id = result.rows[0].id;
                    console.log("id");
                    console.log(id);
                    var user = result.rows[0];
                    var posts = returnpost(id,response,user);
                    // response.status(200).send(result.rows);

                   
                });
            }
            else{
                id = result.rows[0].id;
                console.log("id");
                console.log(id);
                var user = result.rows[0];
                returnpost(id,response,user);
                // user.posts = posts
                // res..status(200).response(user);
            }
        })  
     });
 });

app.post('/post/create', (request, response, next) => {
    pg.connect(connectionString,function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            response.status(400).send(err);
        } 
        console.log("connected to database");
        console.log("fluck post create");
        client.query("INSERT INTO posts(description, name, publishedat, title, url, urltoimage, user_id) values($1, $2, $3, $4, $5, $6, $7) returning description, name, publishedAt, title, url, urlToImage",
        [request.body.description, request.body.name, request.body.publishedAt, request.body.title, request.body.url, request.body.urlToImage, request.body.user_id],  
        // request.body),
        
        function(err,result) {
            done(); // closing the connection;
            if(err){
                console.log(err);
                response.status(400).send(err);
            }
            response.status(200);
        });
    });
});


app.get('/post/delete', (request, response, next) => {
    // const id = request.params.id;
    pg.connect(connectionString,function(err,client,done) {
        if(err){
            console.log("not able to get connection "+ err);
            response.status(400).send(err);
        } 
        console.log("connected to database");
        client.query("DELETE FROM posts WHERE id=($1)",
        [request.body.id],
        // request.body),
        function(err,result) {
            done(); // closing the connection;
            if(err){
                console.log(err);
                response.status(400).send(err);
            }
            client.query("SELECT * FROM users where google_uid = $1", [request.body.google_uid], function(err,result){
                    id = result.rows[0].id;
                    console.log("id");
                    console.log(id);
                    var user = result.rows[0];
                    var posts = returnpost(id,response,user);
            });
        });
     });
});

// app.get('/post/show/:id', function (request, response, next) {
//     const id = request.params.id;
//     pg.connect(connectionString,function(err,client,done) {
//        if(err){
//            console.log("not able to get connection "+ err);
//            response.status(400).send(err);
//        } 
//        client.query('SELECT * FROM posts where user_id = $1', [id],function(err,result) {
//            done(); // closing the connection;
//            if(err){
//                console.log(err);
//                response.status(400).send(err);
//            }
//            response.status(200).send(result);
//        });
//     });
// });

app.listen(3000, () => console.log('Example app listening on port 3000!'))