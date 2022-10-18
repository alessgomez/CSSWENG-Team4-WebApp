const { builtinModules } = require('module')
const mongoose = require('mongoose')

const representativeSchema = new mongoose.Schema({
    idNo: {
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
    contactNo:{
        type: Number,
        required: true
    },
    relationshipToApplicant:{
        type: String,
        required: true
    },
    validId: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Representative', representativeSchema)