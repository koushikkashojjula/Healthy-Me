import user from '../model/user';
import jwt from 'jsonwebtoken';
import config from '../config.js';



const adminLogin = (req,res)=>{
    let username = req.query.username;
    let password = req.query.password;

    if(username === config.adminUsernam && password === config.adminPass){
      let myToken = jwt.sign({adminUsername : config.adminUsername},config.secret);
      return res.status(200).json({success:true,status:'Login Successful',token : myToken});
    }else
      return res.status(200).json({success:false,status:'Incorrect Details'});
};

  const login = (req,res)=>{
    let username = req.query.username;
    let password = req.query.password;
    // let name,username,password;
    user.findOne({'username':username},(err,User)=>{
      if(err)
        return res.status(400).json({success:false,status:'Error Please Try Again'});
      else if(User)
        if(User.password === password){
          // let uuid= require('uuid/v4');
          // var tokenuuid = uuid();
          // var usertoken = new tm.Token({
          //       clientId: username,                //set client id
          //       tokenString: tokenuuid,    //set token content
          //       expiration: 10 * 60 * 1000
          //   });
          // tokenManager.put(usertoken);
          // console.log(tokenuuid);
          var myToken = jwt.sign({username : config.adminUsername},config.secret)
          return res.status(200).json({success:true,status:'Login Successful', clientid: username, token: myToken});
        }
        else
          return res.status(200).json({success:true,status:'Incorrect Password'});
      else
        return res.status(200).json({success:true,status:'Account Does not Exist'});
    })

  }


  const register = (req,res)=>{
    // var data = req.body.User;
    var username = req.body.username;
    var password = req.body.password;
    // let name,username,password;
    user.findOne({'username':username},(err,User)=>{
      if(err)
        //return res.status(400).send("error please try again");
          return res.send(err.toString());
      else if(User)
        return res.status(200).json({success:false,status:'Error!! Account already exists'});
      else{
            var newUser = new user({
              'name': name,
              'username': username,
              'password': password
            })

            newUser.save((err,User)=>{
              console.log(err);
              if(err)
                return res.status(400).json({success:false,status:'Error!! Please Try Again'});
              else
                return res.status(200).json({success:true,status:'Registration Successful'});
            })
      }
    })
  }

export default {adminLogin,login,register}
