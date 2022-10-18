const { builtinModules } = require('module')
const mongoose = require('mongoose')

const documentSchema = new mongoose.Schema({
    documentId: {
        type: Number, 
        required: true
    },
    name: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Document', documentSchema)