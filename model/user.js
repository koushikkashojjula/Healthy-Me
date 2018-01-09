import mongoose from 'mongoose';

const user = new mongoose.Schema({
    'name': {
        'type': String,
        'required': true
    },
    'username': {
        'type': String,
        'unique': true,
        'required': true
    },
    'role':{
        'type': String,
        'required':true
    },
    'password': {
        'type': String,
        'required': true
    },
    'gender':{
        'type': String
    },'notification':{
        'type':Boolean,
        'required':true
    },'iscoordinator':{
        'type':Boolean,
        'required':true,
        'defalt':false
    }

});

export default mongoose.model('Users', user);
