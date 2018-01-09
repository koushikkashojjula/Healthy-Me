/* eslint-disable no-console */
import User from '../model/user';
import question from '../model/question';
import response from '../model/response';
import message from '../model/message';
import survey from '../model/survey';
import jwt from 'jsonwebtoken';
import surveyResponses from '../model/surveyResponse';
import config from '../config';
import Device from '../model/devicetoken';
let uuid= require('uuid/v4');
let schedule = require('node-schedule');



var gcm = require('node-gcm');
var messag = new gcm.Message();
listOfNotificationMessages();

messag.addData('hello', 'world');
messag.addNotification('title', 'Healthy Me');
messag.addNotification('icon', 'healthy_me');
messag.addNotification('body', 'Coach has a new message for you');
messag.addNotification('sound', 'default');


var sender = new gcm.Sender(config.GCM_API_KEY);

const messageJobs = {};

function listOfNotificationMessages(){
    message.find({questionsubtype:{$nin : [-1],ispublished:true}},(err,nextschedule)=>{
        if(nextschedule){
            for(var i=0;i<nextschedule.length;i++){
                scheduleNotifications(nextschedule[i].mid);
            }
        }else{
            console.log('error in scheduling notifications')
        }
    });
}

function push(registrationTokens){
    console.log(registrationTokens);
    sender.send(messag, { registrationTokens: registrationTokens }, function (err, response) {
        if(err)
            console.error(err+' in gcm');
        else
            console.log(response);
    });
}

function setNotificationForUser(usrnames){
    let notifyUsers = [];
    console.log('in setnotificationforuser '+usrnames);
    for(var i=0;i<usrnames.length;i++){
        User.findOne({username:usrnames[i]},(err,usr)=>{
            if(usr){
                if(usr.notification){
                    Device.find({username:usr.username},(err,deviceTokens)=>{
                        if(err){
                            console.log('err in scheduling notifications')
                        }else if(deviceTokens){
                            for(var j=0;j<deviceTokens.length;j++){
                                notifyUsers.push(deviceTokens[j].devicetoken);
                                console.log(i + ' '+deviceTokens[j].devicetoken)
                                if(j===deviceTokens.length-1){
                                    push(notifyUsers);
                                }
                            }
                        }else{
                            console.log('err in scheduling notifications')
                        }
                    })
                }
            }
        });
    }

}

function scheduleNotifications(messageId) {
    message.find({mid:messageId},(err,mes)=>{
        let mesg = mes[0];
        console.log(mesg.users);
        if(mesg.questionsubtype === 0){
            let rule = new schedule.RecurrenceRule();
            let s = mesg.remind[0].split(':');
            let s111 = ((parseInt(s[0]) + 5)%24);
            if(s111<10){
                rule.hour = '0'+s111;
            }else{
                rule.hour = s111
            }
            rule.minute=s[1];
            rule.second=s[2];
            messageJobs[mesg.mid] = schedule.scheduleJob(rule,function () {
                setNotificationForUser(mesg.users);
            });
        }else if(mesg.questionsubtype === 1){
            let rule = new schedule.RecurrenceRule();
            let s = mesg.remind[0].split(':');
            rule.minute=s[1];
            messageJobs[mesg.mid] = schedule.scheduleJob(rule,function () {
                setNotificationForUser(mesg.users);
            });
        }else if(mesg.questionsubtype === 2){
            let rule = new schedule.RecurrenceRule();
            let s = mesg.remind[0].split(':');
            let s111 = ((parseInt(s[0]) + 5)%24);
            if(s111<10){
                rule.hour = '0'+s111;
            }else{
                rule.hour = s111;
            }
            rule.minute=s[1];
            rule.second=s[2];
            messageJobs[mesg.mid] = schedule.scheduleJob(rule,function () {
                setNotificationForUser(mesg.users);
            });
            let rule1 = new schedule.RecurrenceRule();
            let s1 = mesg.remind[1].split(':');
            let s112 = ((parseInt(s1[0]) + 5)%24);
            if(s112<10){
                rule1.hour = '0'+s112;
            }else{
                rule1.hour = s112
            }
            rule1.minute=s1[1];
            rule1.second=s1[2];
            messageJobs[mesg.mid+' 1'] = schedule.scheduleJob(rule1,function () {
                setNotificationForUser(mesg.users);
            });
        }
    });
}

let dbhandlers = {
    login(req,res,next,coord=false){
        let username = req.body.username;
        let password = req.body.password;
        User.findOne({'username':username,iscoordinator:coord},(err,userDetails)=>{
            if(err){
                console.log(err);
            }else if(userDetails){
                if(password===userDetails.password){
                    let tokenGen=jwt.sign({username:userDetails.username,role:userDetails.role},config.secret);
                    console.log(userDetails.role);
                    console.log(new Date());
                    return res.status(200).json({success:true,status:'Successful',token:tokenGen,username:userDetails.username,
                        name:userDetails.name,notification:userDetails.notification});
                }else{
                    console.log(User);
                    return res.status(200).json({success:false,status:'You have entered wrong credentials'});
                }
            }else{
                return res.status(200).json({success:false,status:'User doesn\'t exists'})
            }
        })
    },
    adminlogin(req,res,next){
        let username = req.body.username;
        let password = req.body.password;
        if(username==='admin'){
            if(password==='admin'){
                let tokenGen=jwt.sign({username:'admin',role:'admin'},config.secret);
                res.status(200).json({success:true,status:'Login Successful',token:tokenGen, username : username, adminRole:true});
            }else{
                return res.status(400).json({success:false,status:'You have entered wrong credentials'});
            }
        }else{
            dbhandlers.login(req,res,next,true);
            // return res.status(400).json({success:false,status:'User doesn\'t exists'})
        }
    },
    logout(req,res){
        let token = req.header('token') || req.header.token;
        let device=req.body.devicetoken;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                res.status(400).json({status:'Invalid token',success:false})
            }else if(dec){
                Device.remove({devicetoken:device},(err,data)=>{
                   if(err){
                       res.status(200).json({status:'Please check device token',success:false})
                   } else{
                       res.status(200).json({success:true,status:'Logout successful'})
                   }
                });
            }else{
                res.status(400).json({status:'Invalid token',success:false})
            }
        });
    },
    savetoken(req,res){
        let token = req.header('token') || req.header.token;
        let device = req.body.devicetoken;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                res.status(400).json({success:false,status:'Invalid token'});
            }else if(dec){
                Device.findOne({devicetoken:device},(err,mydevice)=>{
                    if(mydevice){
                        res.status(200).json({success:true,status:'Device already registered'});
                    }else if(err){
                        res.status(400).json({success:false,status:'Unsuccessful'});
                    }else{
                        let thisDevice = new Device({
                            'username':dec.username,
                            'devicetoken':device
                        });
                        thisDevice.save((err,ques)=>{
                            if(err){
                                return res.status(200).json({success:false,status:'Error!! Please Try Again',error:err.toString()});
                            } else if(ques){
                                return res.status(200).json({success:true,status:'Device added successfully'});
                            }else{
                                return res.status(200).json({success:false,status:'Error!! Please Try Again',error:'Device not saved to db'});
                            }
                        });
                    }
                });

            }else{
                res.status(400).json({success:false,status:'Invalid token'});
            }
        });
    },
    updatenotification(req,res){
        let token = req.header('token') || req.header.token;
        let notify = req.body.notification;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                res.status(400).json({success:false,status:'Invalid token'});
            }else if(dec){
                User.update({username:dec.username},{ $set: { notification: notify}},(err,callback)=>{
                    if(err){
                        res.status(200).json({success:false,status:'Unsuccessful',error:err});
                    }else{
                        res.status(200).json({success:true,status:'Preference saved'});
                    }
                });
            }else{
                res.status(400).json({success:false,status:'Invalid token'});
            }
        });
    },
    validate(req,res){
        let usertokenid = req.header.token|| req.header('token');
        jwt.verify(usertokenid,config.secret,(err,decoded)=>{
            if(err)
                return res.status(400).json({success:false,message:'failed to authenticate'});
            else{

                return res.status(200).json(
                    {
                        success:true,
                        status:'User Session valid',
                        tokenId:usertokenid,
                        userData:decoded
                    }
                );
            }
        });
    },
    allUsers(req,res) {
        User.find({},(err, users)=>
        {
            if(err)
            {
                res.status(400).json({success:false,status:'all user data failed'});
            } else
            {
                res.status(200).send(users);
            }
        })
    },
    deleteAllUsers(req,res){
        User.remove({},(err, data)=>{
            if(err){
                res.status(400).json({success:false,status:'all user deletion failed'});
            }
            else{
                res.status(200).json({success:true,status:'all user deleted'});
            }
        })
    },
    deleteAllQuestions(req,res){
        let username = req.header.username|| req.header('username');
        User.findOne({'username':username},(err, user)=>{
            if(err){
                res.status(400).json({success:false,status:'all user deletion failed'});
            }else if(user){
                if(user.role==='admin'){
                    question.remove({},(err,data)=>{
                        if(err){
                            res.status(400).json({success:false,status:'all question deletion failed'});
                        }
                        else{
                            res.status(200).json({success:true,status:'all questions deleted'});
                        }
                    })
                }else{
                    res.status(200).json({success:false,status:'Insufficient permissions'})
                }
            }
        });
    },
    deleteQuestion(req,res){
        let username = req.header.username|| req.header('username');
        let id=req.body.id;
        User.findOne({'username':username},(err, user)=>{
            if(err){
                res.status(400).json({success:false,status:'all user deletion failed'});
            }else if(user){
                if(user.role==='admin'){
                    question.remove({'_id':id},(err,data)=>{
                        if(err){
                            res.status(400).json({success:false,status:'all question deletion failed'});
                        }
                        else{
                            res.status(200).json({success:true,status:'Question deleted'});
                        }
                    })
                }else{
                    res.status(200).json({success:false,status:'Insufficient permissions'});
                }
            }
        });
    },
    addQuestion(req,res){
        let questionText=req.body;
        let token = req.header('token') || req.header.token;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                res.status(400).json({success:false,status:'Unsuccessful',error:err});
            }else if(dec){
                if(dec.role==='admin'){
                    let que=new question({
                        'options':questionText.options,
                        'text':questionText.text,
                        'section':questionText.section,
                        'qtype':questionText.type
                    });
                    que.save((err,ques)=>{
                        if(err){
                            return res.status(400).json({success:false,status:'Error!! Please Try Again',error:err.toString()});
                        } else if(ques){
                            return res.status(200).json({success:true,status:'Question added successfully',Question:ques});
                        }else{
                            return res.status(400).json({success:false,status:'Error!! Please Try Again',error:'Question not saved to db'});
                        }
                    });
                }else{
                    res.status(400).json({success:false,status:'Only admin can add questions',error:err});
                }
            }else{
                res.status(400).json({success:false,status:'Unsuccessful'});
            }
        });
    },
    addMessage(req,res){
        let token = req.header('token') || req.header.token;

      let messag = req.body.message;
      let remind =req.body.remind;
      let questiontype =req.body.questiontype;
      let questionsubtype =req.body.questionsubtype;
      let surveymulti =req.body.surveymulti;
      let surveyrange =req.body.surveyrange;
      jwt.verify(token,config.secret,(err,dec)=>{
          console.log(token+'  '+dec.role);
          if(err){
              return res.status(200).json({success:false,status:'Error!! Try Again',error:err.toString()});
          }else if(dec){
              if(dec.role==='admin'){
                  let msg=new message({
                      'mid':uuid(),
                      'message': messag,
                      'questiontype': questiontype,
                      'questionsubtype' : questionsubtype,
                      'remind' : remind,
                      'surveymulti': surveymulti,
                      'surveyrange': surveyrange
                  });
                  console.log(msg);
                  msg.save((err,mesg)=>{
                      if(err){
                          return res.status(400).json({success:false,status:'Error!! Try Again',error:err.toString()});
                      } else if(mesg){
                          return res.status(200).json({success:true,status:'Question added successfully',message:mesg});
                      }else{
                          return res.status(400).json({success:false,status:'Error!! Please Try Again',error:'Message not saved to db'});
                      }
                  });
              }else{
                  return res.status(200).json({success:false,status:'Only admin can add messages'});
              }
          }
      })
      // console.log(req)
      //check if admin the go ahead

    },
    updateMessage(req,res){
        let users=req.body.users;
        let mid = req.body.mid;
        let ispublished = req.body.ispublished;
        let publishedtime = req.body.publishtime;
        message.update({mid: mid}, { $set: { users: users, ispublished, publishedtime }}, (callback) =>{
            console.log(mid+'update message');
            message.findOne({mid:mid},(err,msg)=>{
                if(msg){
                    if(msg.questionsubtype === -1){
                        setNotificationForUser(msg.users)
                    }else{
                        scheduleNotifications(mid);
                    }
                    res.json({success:true});
                }else{
                    res.json({success:false})
                }
            });


        });
    },
    deleteMessage(req,res){
      let id = req.query.mid
      message.remove({'mid':id},(err,data)=>{
          if(err){
              res.status(200).json({success:false,status:'deletion failed',error:err});
          }
          else{
              /*console.log(messageJobs[id]);
              if(messageJobs[id] !== null){
                  messageJobs[id].cancel();
              }*/
              res.status(200).json({success:true,status:'deletion success'});
          }
      })
    },
    getAllMessage(req,res) {
        let token = req.header('token') || req.header.token;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                res.status(200).json({success:false,status:'Unsuccessful',error:err})
            }else if(dec){
                if(dec.role==='admin'){
                    message.find({},(err,msgs)=>
                    {
                        if(err)
                        {
                            res.status(200).json({success:false,status:'all User data failed'});
                        } else
                        {
                            res.status(200).send(msgs);
                        }
                    });
                }else{
                    res.status(200).json({success:false,status:'Only admin has permissions'})
                }
            }else{
                res.status(200).json({success:false,status:'Unsuccessful'})
            }
        });
    },
    getMessageForAdminByUsername(req,res){
        let usernam=req.query.username;
        let token = req.header('token') || req.header.token;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(dec){
                if(dec.role==='admin'){
                    message.find({ispublished:true,users:usernam},(err,msgs)=>{
                        if(err)
                        {
                            res.status(200).json({success:false,status:'all Message data failed'});
                        } else
                        {
                            //console.log(dec);
                            response.find({username:usernam},(err,resps)=>{
                                if(err)
                                {
                                    res.status(200).json({success:false,status:'all User data failed'});
                                } else
                                {
                                    res.status(200).json({success:true,status:'Success',message:msgs,responses:resps});
                                }
                            })
                        }
                    });
                }else{
                    res.status(200).json({success:false,status:'Only admin has permissions'});
                }
            }else{
                res.status(400).json({success:false,status:'Unsuccessful'})
            }
        });
    },
    getMessageById(req,res){
        let token = req.header('token') || req.header.token;
        jwt.verify(token,config.secret,(err,dec)=>{
            if(dec){
                message.find({ispublished:true,users:dec.username,questiontype:[1,2]},(err,msgs)=>{
                    if(err)
                    {
                        res.status(200).json({success:false,status:'all User data failed'});
                    } else
                    {
                        console.log(dec);
                        response.find({username:dec.username},(err,resps)=>{
                            if(err)
                            {
                                res.status(200).json({success:false,status:'all User data failed'});
                            } else
                            {
                                survey.find({users:dec.username,ispublished:{$nin:[false]}},(err,surveys)=>{
                                    if(err){
                                        res.status(200).json({success:false,status:'all User data failed'});
                                    }else{
                                        var sids = []
                                        for(var j=0;j<surveys.length;j++){
                                            sids.push(surveys[j].sid)
                                        }
                                        surveyResponses.find({username:dec.username,sid:sids},(err,surres)=>{
                                            if(surres){
                                                res.json({success:true,messages:msgs,responses:resps,surveys:surveys,surveyresponses:surres})
                                            }
                                        })

                                    }
                                });

                            }
                        })
                    }
                });
            }else{
                res.status(400).json({success:false,status:'Unsuccessful'})
            }
        });
    },
    showQuestion(req,res){
        let surveyId=req.query.sid;
        survey.findOne({sid:surveyId},(err,survey)=>{
            if(survey){
                let qids=survey.quesionsassociated
                message.find({mid:qids},(err,questions)=>{
                    if(questions){
                        res.json({questions:questions});
                    }else{
                        res.json({success:false});
                    }
                })
            }else{
                res.json({success:false});
            }
        })
    },
    submitResponse(req,res){
        let token = req.header.token||req.header('token');
        let mid=req.body.mid;
        let answer=req.body.answer;
        jwt.verify(token,config.secret,(err,dec)=>{
           if(err){
               return res.status(200).json({success:false,status:'Error!!!!! Try Again'});
           } else if(dec){

               let newResp = new response({
                   'rid':uuid(),
                   'username':dec.username,
                   'qid':mid,
                   'responses':[answer]
               });

               newResp.save((err,resp)=>{
                   if(err){
                       return res.status(200).json({success:false,status:'Error!! Try Again',error:err});
                   }else{
                       return res.status(200).json({success:true,status:'Success',response:resp});
                   }
               });
           }else{
               return res.status(400).json({success:false,status:'Error Try Again'});
           }
        });
    },
    submitAnswers(req,res){
        let token = req.header('token') || req.header.token;
        let resps= req.body;
        let sid = req.query.sid;

        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                return res.status(200).json({success:false,status:'Error!! Try Again',error:err});
            }else if(dec){
                survey.findOne({sid:sid},(err,survey)=>{
                    if(survey){
                        var responses=[]
                        for (var i = 0; i < resps.length; i++) {
                            (function(){
                                var obj = {};
                                obj.response=resps[i].response;
                                message.findOne({mid:resps[i].qid},(err,question)=>{
                                    if(question){
                                        obj.qid = question.mid;
                                        obj.name=question.message;
                                        responses.push(obj);
                                        if(responses.length==resps.length){
                                            let newSurvey = new surveyResponses({
                                                'username':dec.username,
                                                'responses':responses,
                                                'sid':sid,
                                                'surveyname':survey.survey
                                            });
                                            newSurvey.save((err,resp)=>{
                                                if(err){
                                                    return res.status(200).json({success:false,status:'Error!! Please Try Again',error:err});
                                                }else{
                                                    return res.status(200).json({success:true,status:'Success',surveyresponse:resp});
                                                }
                                            });
                                            //console.log(responses)
                                        }
                                    }else{
                                        res.json({success:false})
                                    }
                                })
                            })();
                        }
                    }else{
                        res.json({success:false})
                    }
                });



            }else{
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }
        });

    },
    deleteResponse(req,res){
        let username = req.header.username|| req.header('username');
        let id=req.body.id;
        User.findOne({'username':username},(err, user)=>{
            if(err){
                res.status(400).json({success:false,status:'all user deletion failed'});
            }else if(user){
                if(user.role==='admin'){
                    response.remove({'_id':id},(err,data)=>{
                        if(err){
                            res.status(400).json({success:false,status:'all question deletion failed'});
                        }
                        else{
                            res.status(200).json({success:true,status:'Question deleted'});
                        }
                    })
                }else{
                    res.status(200).json({success:false,status:'Insufficient permissions'})
                }
            }
        });
    },
    getResponse(req,res){
        let username = req.header.username|| req.header('username');
        response.find({'username':username},(err,respo)=>{
            if(err){
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }else if(respo){
                if(respo.responses !== null && respo.length>0){
                    return res.status(200).json({success:true,status:'Successful',response:respo});
                }else{

                    return res.status(200).json({success:false,status:'UnSuccessful',response:respo});
                }
            }else{
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }
        });
    },
    responses(req,res){
        let token = req.header.token|| req.header('token');
        jwt.verify(token,config.secret,(err, dec)=>{
            if(err){
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }else if(dec){
                if(dec.role==='admin'){
                    surveyResponses.find({},(err,resps)=>{
                        if(err){
                            return res.status(200).json({success:false,status:'Error!! Please Try Again'});
                        }else if(resps){
                            return res.status(200).json({success:true,status:'Successful',responses:resps});
                        }else{
                            return res.status(200).json({success:false,status:'Error!! Please Try Again'});
                        }
                    });
                }else{
                    return res.status(200).json({success:false,status:'Only admin can get responses'});
                }
            }
        });
    },
    addUser(req,res){
        //let username = req.header.username|| req.header('username');

        let name = req.body.name;
        let username = req.body.username;
        let password = req.body.password;
        let notification=true;
        let iscoordinator = req.body.iscoordinator
        let token = req.header('token') || req.header.token;
        let role = req.body.role;


        /*let newUser = new User({
            'name': 'admin',
            'username': 'admin',
            'password': 'admin',
            'role':'admin',
            'notification':false
        });

        newUser.save((err,u)=>{
            console.log(err);
            if(err)
                return res.status(400).json({success:false,status:'User already exists or you have entered invalid data'});
            else
                return res.status(200).json({success:true,status:'Registration Successful',user:u});
        });*/


        jwt.verify(token,config.secret,(err,decoded)=>{
            if(err){
                return res.status(400).json({success:false,status:'Unsuccessful'});
            }else if(decoded){
                if(decoded.role === 'admin'){
                    let newUser = new User({
                        'name': name,
                        'username': username,
                        'password': password,
                        'iscoordinator': iscoordinator,
                        'role':role,
                        'notification':notification
                    });

                    newUser.save((err,u)=>{
                        console.log(err);
                        if(err)
                            return res.status(400).json({success:false,status:'User already exists or you have entered invalid data'});
                        else
                            return res.status(200).json({success:true,status:'Registration Successful',userDetails:u});
                    });
                }else{
                    return res.status(400).json({success:false,status:'Only admin can add users'});
                }
            }else{
                return res.status(400).json({success:false,status:'Unsuccessful'});
            }
        })
    },
    updateUser(req,res){
        User.findOneAndUpdate({username:'test6'},{$set:{notification:'false'}},function(err, result){
            if(err){
                return res.status(400).json({success:false,status:'User '});
            }else{
                return res.status(400).json({success:false,status:'User already',result:result});
            }
        })
        /*User.findOne({username: 'test8'},(err, doc)=>{
            if(err){
                res.status(400).json({success:false,status:'Unsucessful'});
            }else if(doc){
                var u=doc;
                //u.notification=false;
                User.remove({'username':doc.username},(err,data)=>{
                    console.log(data);
                    u.save((err,u)=>{
                        console.log(err);
                        if(err)
                            return res.status(400).json({success:false,status:'User already exists or you have entered invalid data'});
                        else
                            return res.status(200).json({success:true,status:'Registration Successful',User:u});
                    });
                });

                //res.status(200).json({success:true,status:'Success',doc:doc});
            }else{
                res.status(400).json({success:false,status:'Unsucessful'});
            }
        });*/

        /*let newUser = new User({
            'name': 'test10',
            'username': 'test10',
            'password': 'test10',
            'role':'User',
            'gender':'male'
        });

        newUser.save((err,u)=>{
            console.log(err);
            if(err)
                return res.status(400).json({success:false,status:'User already exists or you have entered invalid data'});
            else
                return res.status(200).json({success:true,status:'Registration Successful',User:u});
        });*/

    },
    getSurveyResponses(req,res){
        let token = req.header('token') || req.header.token;
        let username=req.query.username;

        jwt.verify(token,config.secret,(err,dec)=>{
            if(err){
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }else if(dec){
                surveyResponses.find({'username':username},(err,resps)=>{
                    if(err){
                        return res.status(200).json({success:false,status:'Error!! Please Try Again'});
                    }else{
                        return res.status(200).json({success:true,status:'Success',surveyresponse:resps});
                    }
                })
            }else{
                return res.status(200).json({success:false,status:'Error!! Please Try Again'});
            }
        });
    },
    addSurvey(req,res){
      let token = req.header('token') || req.header.token;
      let surve = req.body.survey;
      let ispublished =req.body.ispublished;
      let publishedtime =req.body.publishedtime;
      let quesionsassociated =req.body.quesionsassociated;
      let users =req.body.users;
      jwt.verify(token,config.secret,(err,dec)=>{
          console.log(token+'  '+dec.role);
          if(err){
              return res.status(200).json({success:false,status:'Error!! Try Again',error:err.toString()});
          }else if(dec){
              if(dec.role==='admin'){
                  let sur =new survey({
                      'sid':uuid(),
                      'survey': surve,
                      'ispublished': ispublished,
                      'quesionsassociated' : quesionsassociated,
                      'users' : users,
                      'publishedtime': publishedtime
                  });
                  sur.save((err,mesg)=>{
                      if(err){
                          return res.status(200).json({success:false,status:'Error!! Try Again',error:err.toString()});
                      } else if(mesg){
                          return res.status(200).json({success:true,status:'Question added successfully',survey:mesg});
                      }else{
                          return res.status(200).json({success:false,status:'Error!! Please Try Again',error:'Message not saved to db'});
                      }
                  });
              }else{
                  return res.status(200).json({success:false,status:'Only admin can add messages'});
              }
          }
      })
    },
    getAllSurvey(req,res){
      let token = req.header('token') || req.header.token;
      jwt.verify(token,config.secret,(err,dec)=>{
          if(err){
              res.status(200).json({success:false,status:'Unsuccessful',error:err})
          }else if(dec){
              if(dec.role==='admin'){
                  survey.find({},(err,msgs)=>
                  {
                      if(err)
                      {
                          res.status(200).json({success:false,status:'all survey data failed'});
                      } else
                      {
                          res.status(200).send(msgs);
                      }
                  });
              }else{
                  res.status(200).json({success:false,status:'Only admin has permissions'})
              }
          }else{
              res.status(200).json({success:false,status:'Unsuccessful'})
          }
      });
    },
    updateSurvey(req,res){
      let users=req.body.users;
      let sid = req.body.sid;
      let quesionsassociated =req.body.quesionsassociated;
      let ispublished = req.body.ispublished;
      let publishedtime = req.body.publishedtime;
      survey.update({sid: sid}, { $set: { users: users, ispublished, publishedtime, quesionsassociated }}, (callback) =>{
          survey.find({},(err,msgs)=>{
              if(err){
                  return res.status(200).json({success:false,status:'Error!!!!! Try Again'});
              }else{
                  // for (let i = 0, len = msgs.length; i < len; i++) {
                  //     scheduleNotifications(msgs[i].mid);
                  // }
                  res.status(200).json({success:true,status:'updated successfully'});
              }
          });

      });
    },
    deleteSurvey(req,res){
      let sid = req.query.sid
      survey.remove({'sid':sid},(err,data)=>{
          if(err){
              res.status(200).json({success:false,status:'deletion failed',error:err});
          }
          else{
              /*console.log(messageJobs[id]);
              if(messageJobs[id] !== null){
                  messageJobs[id].cancel();
              }*/

              // deletion not working
              res.status(200).json({success:true,status:'deletion success'});
          }
      })
    }
};

export default dbhandlers;
