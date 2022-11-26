const { builtinModules } = require('module')
const mongoose = require('mongoose')

const updateSchema = new mongoose.Schema({
    updateNo: {
        type: Number,
        required: true 
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Employee',
        required: true
    },
    applicationNo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Application', 
        required: true
    },
    newStage: {
        type: String,
        required: true
    },
    dateUpdated: {
        type: Date, 
        required: true,
        default: Date.now
    }
})

module.exports = mongoose.model('Update', updateSchema)