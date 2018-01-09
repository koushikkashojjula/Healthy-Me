var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');
var express =  require('express');
var app = express();
import bodyParser from 'body-parser';
import tweetservice from './services/tweetservice'
import webServices from './services/webservices'
import mongoose from 'mongoose';
import confi from './config.js';
import expressJWT from 'express-jwt';
import jwt from 'jsonwebtoken';
import router from './routes';
// import cors from 'cors';
mongoose.connect(confi.db.uri, {}, (err)=> {
  if (err) {
    console.log('Connection Error: ', err);
  } else {
    console.log('Successfully Connected');
  }
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('resources'))
// app.use(expressJWT({ secret : confi.secret}).unless({path:['/login','/adminLogin']}));

// app.get('/tweets',tweetservice.getAll);
// app.get('/adminLogin',webServices.adminLogin);
// app.get('/login',webServices.login);
// app.post('/register',webServices.register);
// app.use('/',function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "http://localhost:4000");
//   res.header("Access-Control-Allow-Credentials",true);
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use("/api",router);

app.listen(3000, '0.0.0.0', function (err, result) {
    if (err) {
      console.log(err);
    }
    console.log('Running at http://0.0.0.0:3000');
  });
