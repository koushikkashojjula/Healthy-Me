import mongoose from 'mongoose';


const message = new mongoose.Schema({
    'message':{
        'type': String,
        'required':true
    },
    'users':{
        'type':[String],
        'required':false
    },
    'remind':{
      'type': [String],
      'required':false
    },
    'surveymulti':{
      'type': [String],
      'required':false
    },
    'surveyrange':{
      'type': [String],
      'required':false
    },
    'questiontype':{
      'type': Number,
      'required':false
    },'questionsubtype':{
      'type': Number,
      'required':false
    },'ispublished':{
      'type': Boolean,
      'required': true,
      'default': false
    },'publishedtime':{
      'type': String,
      'required': false
    },'mid':{
        'type': String,
        'required':true,
        'unique':true
    }
});

export default mongoose.model('Message6', message);
