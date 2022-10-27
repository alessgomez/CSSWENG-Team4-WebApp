const { builtinModules } = require('module')
const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
    clientNo: {
        type: Number, 
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    middleName: {
        type: String,
        required: true
    },
    lastName: {
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
    },
    validId: {
        type: String
    }
})

module.exports = mongoose.model('Client', clientSchema)