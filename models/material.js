const { builtinModules } = require('module')
const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    materialNo: {
        type: Number,
        required: true
    },
    connectionType: {
        type: String, 
        required: true
    },
    materials: [{
        name: {
            type: String, 
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }]
})

module.exports = mongoose.model('Material', materialSchema)