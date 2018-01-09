import mongoose from 'mongoose';


const tokens = new mongoose.Schema({
    'username':{
        'type': String, 'required': true
    },
    'devicetoken': {
        'type': String, 'required': true,unique:true
    }
});



export default mongoose.model('DeviceTokens', tokens);
