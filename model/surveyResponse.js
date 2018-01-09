import mongoose from 'mongoose';
//import answer from '../model/answer'



const surveyResponses = new mongoose.Schema({
    'username': {
        'type': String, 'required': true
    },
    'sid':{
        'type':String,'required':true
    },
    'surveyname':{
        'type':String,'required':true
    },
    'responses': {
        'type':[{'qid':String,'response':String,'name':String}]
    }
});



export default mongoose.model('SurveyResponses2', surveyResponses);