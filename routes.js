import express from 'express';
let router = express.Router();
import dbhandlers from './services/handler'
import jwt from 'jsonwebtoken';
import config from './config';


router.use((req,res,next)=>{
    if(req.path===('/login') || req.path === '/adminlogin'){
        next();
    }else{
        let token = req.header.token|| req.header('token');
        if(token){
            jwt.verify(token,config.secret,(err,decoded)=>{
              if(err)
                  return res.status(400).json({success:false,message:'failed to authenticate'});
              else{
                  next();
              }
          });
        }
        else
            return res.status(400).json({success:false,message:'token needed'});
    }
});


router.post('/addUser',dbhandlers.addUser);

router.post('/adminlogin',dbhandlers.adminlogin);

router.post('/login',dbhandlers.login);

router.post('/message',dbhandlers.addMessage);

router.get('/message',dbhandlers.getAllMessage);

router.put('/message',dbhandlers.updateMessage);

router.delete('/message',dbhandlers.deleteMessage);

router.post('/survey',dbhandlers.addSurvey);

router.get('/survey',dbhandlers.getAllSurvey);

router.put('/survey',dbhandlers.updateSurvey);

router.delete('/survey',dbhandlers.deleteSurvey);

router.delete('/allQuestions',dbhandlers.deleteAllQuestions);

router.post('/logout',dbhandlers.logout);

router.get('/valid',dbhandlers.validate);

router.get('/users',dbhandlers.allUsers);

router.delete('/users',dbhandlers.deleteAllUsers);

router.post('/addQuestion',dbhandlers.addQuestion);

router.get('/showQuestions',dbhandlers.showQuestion);

router.delete('/deleteQuestion',dbhandlers.deleteQuestion);

router.post('/submitAnswers',dbhandlers.submitAnswers);

router.get('/responses',dbhandlers.responses);

router.get('/getResponse',dbhandlers.getResponse);

router.delete('/response',dbhandlers.deleteResponse);

router.get('/logout',dbhandlers.logout);

router.get('/updateUser',dbhandlers.updateUser);

router.get('/getMessages',dbhandlers.getMessageById);

router.post('/submitResponse',dbhandlers.submitResponse);

router.get('/getmessage',dbhandlers.getMessageForAdminByUsername);

router.get('/getSurveyResponses',dbhandlers.getSurveyResponses);

router.post('/notification',dbhandlers.updatenotification);

router.post('/savetoken',dbhandlers.savetoken);


export default router;
