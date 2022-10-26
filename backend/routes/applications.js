const express = require('express')
const router = express.Router()
const Application = require('../models/application')
const Client = require('../models/client')

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

//Creating New Client + Application
router.post('/', generateNums, async (req, res) => {
    // Create client
    const client = new Client({
        clientNo: res.clientNum,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo
    })

    try{
        const newClient = await client.save()
        //res.status(201).json(newClient)
        
        // Create application
        const application = new Application({
            applicationNo: Number(res.applicationNum),
            applicantNo: newClient._id,
            establishmentName: req.body.establishmentName, 
            address: req.body.address,
            referenceClientNo: res.refClient,
            landmark: req.body.landmark,
            ownership: req.body.ownership,
        })

        try{
            const newApplication = await application.save()
            res.status(201).json(newClient + newApplication)
        } catch(err){
            res.status(400).json({message: err.message})
        }
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

async function generateNums(req, res, next) {
    let clients
    let applications
    let refClient

    try {
        clients = await Client.find()

        if (clients == null)
            return res.status(404).json({message: 'No database entries'})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    try {
        applications = await Application.find()

        if (applications == null)
            return res.status(404).json({message: 'No database entries'})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    try{
        refClient = await Client.findOne({firstName: req.body.refFirstName, middleName:req.body.refMiddleName, lastName: req.body.refLastName, clientNo: req.body.refClientNo})
        if (refClient == null){
            return res.status(404).json({message: 'Cannot find client'})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.clientNum = clients.length
    res.applicationNum = applications.length
    res.refClient = refClient._id
    next()
}

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