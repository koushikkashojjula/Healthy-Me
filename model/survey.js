import mongoose from 'mongoose';


const survey = new mongoose.Schema({
  'survey':{
      'type': String,
      'required':true
  },
  'users':{
      'type':[String],
      'required':false
  },
  'quesionsassociated':{
    'type':[String],
    'required':false
  },
  'sid':{
    'type': String,
    'required':true
  },'ispublished':{
    'type': Boolean,
    'required': true,
    'default': false
  },'publishedtime':{
    'type': String,
    'required': false
  }
});

export default mongoose.model('survey', survey);
