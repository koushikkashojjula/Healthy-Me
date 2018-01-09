import mongoose from 'mongoose';
//var dateTime = require('node-datetime');


const question = new mongoose.Schema({
    'text':{
        'type': String,
        'required':true
    },
    'section': {
        'type': String,
        'required': true
    },
    'options':{
        'type':[String]
    },'qtype':{
        'type':String
    }
});

export default mongoose.model('Questions', question);
