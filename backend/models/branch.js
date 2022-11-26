const { builtinModules } = require('module')
const mongoose = require('mongoose')

const branchSchema = new mongoose.Schema({
    branchNo: {
        type: Number, 
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    openTime: {
        type: String,
        required: true
    },
    closeTime: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Branch', branchSchema)