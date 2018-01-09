import mongoose from 'mongoose';
//import answer from '../model/answer'



const responses = new mongoose.Schema({
    'rid':{
        'type': String, 'required': true,'unique':true
    },
    'username': {
        'type': String, 'required': true
    },
    'qid':{
        'type': String,'required':true
    },
    'responses': {
        'type':[String]
    }
});



export default mongoose.model('Responses', responses);
