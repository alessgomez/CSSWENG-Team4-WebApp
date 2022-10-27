const express = require('express')
const router = express.Router()
const Application = require('../models/application')
const Client = require('../models/client')
const Document = require('../models/document')
const Representative = require('../models/representative')
const path = require('path'); // Local path directory for our static resource folder

//Creating New Client + Application
router.post('/step1', generateNums, async (req, res) => {
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
            applicationNo: res.applicationNum,
            applicantNo: newClient._id,
            establishmentName: req.body.establishmentName, 
            address: req.body.address,
            referenceClientNo: res.refClient,
            landmark: req.body.landmark,
            ownership: req.body.ownership,
        })

        try{
            const newApplication = await application.save()
            //res.status(201).json(newClient + newApplication)
            res.send({clientNo: newClient.clientNo})
        } catch(err){
            res.status(400).json({message: err.message})
        }
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// Uploading valid ID for application
router.patch('/step2/:id', getClient, (req, res) => {
    const image = req.files.validId
    image.mv(path.resolve(__dirname, 'public/validIds',image.name), async (error) => {
        res.client.validId = '/validIds/' + image.name
        try {
            const updatedClient = await res.client.save()
            res.json(updatedClient)
        } catch(err) {
            res.status(400).json({message: err.message})
        }
    })
})



/*
app.post('/submit-post', function(req, res) {
    const {image} = req.files
    image.mv(path.resolve(__dirname,'public/images',image.name),(error) => {
        Post.create({
            ...req.body,
            image:'/images/'+image.name
        }, (error,post) => {
            res.redirect('/')
        })
    })
});
    -----
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


//patch
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
})*/

// Creating representative, if applicable
router.post('/step2a', generateRepNumAndApp, async (req, res) => {
    const representative = new Representative ({
        idNo: res.repNum,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo,
        relationshipToApplicant: req.body.relationship,
        validId: req.body.validId
    })

    try {
        const newRepresentative = await representative.save()
        res.application.representativeNo = newRepresentative._id
        res.application.save()
        res.status(201).json(newRepresentative)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

/* *********** TEMPLATE FUNCTIONS *************************
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
    
}) ****************************** */

async function generateNums(req, res, next) {
    let clients
    let applications
    let refClient

    try {
        clients = await Client.find()
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    try {
        applications = await Application.find()
    } catch (err) {
        return res.status(500).json({message: err.message})
    }

    try{
        refClient = await Client.findOne({firstName: req.body.refFirstName, middleName:req.body.refMiddleName, lastName: req.body.refLastName, clientNo: req.body.refClientNo})
    } catch(err) {
        res.status(500).json({message: err.message})
    }

    res.clientNum = clients.length
    res.applicationNum = applications.length
    if (refClient != null)
        res.refClient = refClient._id
    next()
}

/*async function generateDocNumAndApp(req, res, next) {
    let documents
    let applications

    try {
        documents = await Document.find()
        applications = await Application.find()
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.docNum = documents.length
    res.application = applications[applications.length-1]
    next()
}

router.post('/submitID', generateDocNumAndApp, async (req, res) => {
    const document = new Document ({
        documentId: res.docNum,
        name: req.body.name
    })

    try {
        const newDocument = await document.save()
        res.application.documents.push(newDocument._id)
        res.application.save()
        res.status(201).json(newDocument)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})
*/

async function generateRepNumAndApp(req, res, next) {
    let representatives

    try {
        representatives = await Representative.find()
        applications = await Application.find()
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.repNum = representatives.length
    res.application = applications[applications.length-1]
    next()
}

/* async function getApplication(req, res, next) {
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
}*/

async function getClient(req, res, next) {
    let client 
    try{
        client = await Client.findById(req.params.id)
        if (client == null){
            return res.status(404).json({message: 'Cannot find client'})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.client = client
    next()
}

module.exports = router