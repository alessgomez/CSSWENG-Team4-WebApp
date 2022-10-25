const { builtinModules } = require('module')
const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    clientNo: {
        type: Number, 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true  
    },
    contactNo: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Client', clientSchema)