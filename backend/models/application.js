const { builtinModules } = require('module')
const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema({
    applicationNo: {
        type: Number, 
        required: true
    },
    applicantNo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Client',
        required: true
    },
    referenceClientNo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Client'
    },
    representativeNo: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Representative'
    },
    establishmentName: {
        type: String
    },
    address: {
        type: String, 
        required: true
    },
    landmark: {
        type: String
    },
    ownership: {
        type: String, 
        required: true
    },
    connectionType: {
        type: String
    },
    nearestBranch: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Branch'
    },
    fee: {
        type: Number
    },
    documents: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Document'
    }],
    startDate: {
        type: Date, 
        required: true,
        default: Date.now
    },
    completionDate: {
        type: Date
    },
    applicationStage: {
        type: String,
        required: true,
        default: 'upload requirements'
    }

})

module.exports = mongoose.model('Application', applicationSchema)