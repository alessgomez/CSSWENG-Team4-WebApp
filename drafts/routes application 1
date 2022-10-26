const express = require('express')
const router = express.Router()
const Client = require('../models/client')
const Application = require('../models/application')

//Step 1 - Customer Information
router.post('/', (req, res) => {
    
    var nClients
    var refClientNo
    var applicantNo
    var applicationNo
    var client 
    var application
    //create client record 
    Client.find({})
    .then(function(result){
        nClients = result.length

        client = new Client({
            clientNo: nClients,
            firstName: req.body.firstName,
            middleName: req.body.middleName,
            lastName: req.body.lastName,
            email: req.body.email,
            contactNo: req.body.contactNo
        })
    
        /*try{
            const newClient = client.save()
            //res.status(201).json(newClient)
        } catch(err){
            res.status(400).json({message: err.message})
        }*/

        return Client.findOne({firstName: req.body.refFirstName, middleName: req.body.refMiddleName, lastName: req.body.refLastName, clientNo: req.body.refClientNo})
    })
    .then(function(result){
        if (result != null)
            refClientNo = result._id
        else
            refClientNo = null

        return Client.findOne({clientNo: nClients})
    })
    .then(function(result) {
        if (result != null)
            applicantNo = result._id
        else
            applicantNo = null
        
        return Application.find()
    })
    .then(function(result) {
        applicationNo = result.length

        application = new Application({
            applicationNo: applicationNo,
            applicantNo: applicantNo,
            establishmentName: req.body.establishmentName, 
            address: req.body.address,
            refClientNo: refClientNo,
            landmark: req.body.landmark,
            ownership: req.body.ownership,
        })

        /*try{
            const newApplication = application.save()
            res.status(201).json(newApplication)
        } catch(err){
            res.status(400).json({message: err.message})
        }*/
    })
    .then(function(){
        try{
            const newClient = client.save()
            const newApplication = application.save()
            res.status(201).json(JSON.stringify(newApplication) + JSON.stringify(newClient))
        } catch(err){
            res.status(400).json({message: err.message})
        }
    })

/*    Client.findOne({firstName: req.body.refFirstName, middleName: req.body.refMiddleName, lastName: req.body.refLastName, clientNo: req.body.refClientNo}, "", async (error, result) => {
        if (result != null)
            refClientNo = result._id
        else
            refClientNo = null

        const application = new Application({
            //applicationNo
            //applicantNo
            establishmentName: req.body.establishmentName, 
            address: req.body.address,
            refClientNo: refClientNo,
            landmark: req.body.landmark,
            ownership: req.body.ownership,
        })

        try{
            const newApplication = await application.save()
            res.status(201).json(newApplication)
        } catch(err){
            res.status(400).json({message: err.message})
        }
    })*/
})

//TEMPLATE FUNCTIONS ***

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

//END OF TEMPLATE FUNCTIONS ***

module.exports = router
