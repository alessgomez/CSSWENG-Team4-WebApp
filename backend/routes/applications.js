const express = require('express')
const router = express.Router()
const Application = require('../models/application')

// Getting all
router.get('/', async (req, res) => {
    try{
        const applications = await Application.find()
        res.json(applications)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

// Getting One
router.get('/:id', getApplication, (req, res) => {
    res.json(res.application)
})

//Creating One
router.post('/', async (req, res) => {
    const application = new Application({
        name: req.body.name,
        subscribedToChannel: req.body.subscribedToChannel
    })

    try{
        const newApplication = await application.save()
        res.status(201).json(newApplication)
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

//Updating One
router.patch('/:id', getApplication, async (req, res) => {
    if (req.body.name != null) {
        res.application.name = req.body.name
    }

    if (req.body.subscribedToChannel != null) {
        res.application.subscribedToChannel = req.body.subscribedToChannel
    }
    try {
        const updatedApplication = await res.application.save()
        res.json(updatedApplication)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

//Deleting One
router.delete('/:id', getApplication, async (req, res) => {
    try{
        await res.application.remove()
        res.json({message: "Deleted Application"})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
    
})

async function getApplication(req, res, next) {
    let application 
    try{
        application = await Application.findById(req.params.id)
        if (application == null){
            return res.status(404).json({message: 'Cannot find application'})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.application = application
    next()
}

module.exports = router