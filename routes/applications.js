const express = require('express')
const router = express.Router()
const Application = require('../models/application')
const Client = require('../models/client')
const Document = require('../models/document')
const Representative = require('../models/representative')
const Material = require('../models/material')

const path = require('path') // Local path directory for our static resource folder
const fileUpload = require('express-fileupload')
const {PDFDocument} = require('pdf-lib')
const {readFile, writeFile} = require('fs/promises')

router.use(express.static('public'))
router.use(fileUpload())

// Step 1: Creating new client + application
router.post('/step1', generateNums, async (req, res) => {
    const client = new Client({
        clientNo: res.clientNum,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo
    })

    try {
        const newClient = await client.save()
        
        const application = new Application({
            applicationNo: res.applicationNum,
            applicantNo: newClient._id,
            establishmentName: req.body.establishmentName, 
            address: req.body.address,
            referenceClientNo: res.refClient,
            landmark: req.body.landmark,
            ownership: req.body.ownership,
            connectionType: req.body.connectionType //remove if there is already admin side
        })

        try{
            const newApplication = await application.save()
            res.send({applicationNo: newApplication.applicationNo}) //check
        } catch(err){
            res.status(400).json({message: err.message})
        }
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// Step 2: Uploading valid ID for application
router.patch('/step2/:id', getApplication, (req, res) => {
    const image = req.files.validId
    if (image.name.split('.')[1] == "png" || image.name.split('.')[1] == "jpg" || image.name.split('.')[1] == "jpeg" || image.name.split('.')[1] == "pdf")
        image.mv(path.resolve(__dirname, '../public/validIds',image.name), async (error) => {
            res.application.validId = '/validIds/' + image.name
            
            if (req.body.hasRepresentative == true)
                res.application.applicationStage = 'Adding Representative'
            else 
                res.application.applicationStage = 'Printing and Preparing Documents'

            try {
                const updatedApplication = await res.application.save()
                res.send({applicationNo: updatedApplication.applicationNo})
            } catch(err) {
                res.status(400).json({message: err.message})
            }
        })
    else
        res.send({message: 'Invalid file type'})
})

// Step 2A: Creating representative, if applicable TODO!
router.post('/step2a/:id', generateRepNumAndApp, async (req, res) => {
    
    const representative = new Representative ({
        idNo: res.repNum,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        contactNo: req.body.contactNo,
        relationshipToApplicant: req.body.relationship,
        validId: ""
    })

    const image = req.files.validId
    if (image.name.split('.')[1] == "png" || image.name.split('.')[1] == "jpg" || image.name.split('.')[1] == "jpeg" || image.name.split('.')[1] == "pdf")
        image.mv(path.resolve(__dirname, '../public/validIds',image.name), async (error) => {
            representative.validId = '/validIds/' + image.name
            
            try {
                const newRepresentative = await representative.save()
                res.application.representativeNo = newRepresentative._id
                res.application.applicationStage = 'Printing and Preparing Documents'
                
                try {
                    const updatedApplication = await res.application.save()
                    res.send({applicationNo: updatedApplication.applicationNo})
                } catch(err) {
                    res.status(400).json({message: err.message})
                }
            } catch(err) {
                res.status(400).json({message: err.message})
            }
        })
    else
        res.send({message: 'Invalid file type'})
})

router.get('/step3-1/:id', getApplication, async (req, res) => {
    await createAppForm('./public/files/Application Form.pdf', './public/files/Application Form-' + res.application.applicationNo + '.pdf', res.application)
    res.download(path.resolve(__dirname, '../public/files/Application Form-' + res.application.applicationNo + '.pdf'), function(err) {
        if (err){
            console.log(err);
        }
    })
})

router.get('/step3-2/:id', getApplication, async (req, res) => {
    res.download(path.resolve(__dirname, '../public/files/Customer Reminders Slip.pdf'), async function(err) {
        if (err){
            console.log(err);
        }
        else 
        {
            if (res.application.representativeNo == null)
            {
                res.application.applicationStage = 'Waiting for Survey Schedule'
    
                try {
                    const updatedApplication = await res.application.save()
                } catch(err) { 
                    console.log(err)
                }
            }
        }
    })
})

router.get('/step3-3/:id', getApplication, async (req, res) => {
    await createAuthLetter('./public/files/Authorization Letter.pdf', './public/files/Authorization Letter-' + res.application.applicationNo + '.pdf', res.application)
    res.download(path.resolve(__dirname, '../public/files/Authorization Letter-' + res.application.applicationNo + '.pdf'), async function(err) {
        if (err){
            console.log(err);
        }
        else 
        {
            res.application.applicationStage = 'Waiting for Survey Schedule'

            try {
                const updatedApplication = await res.application.save()
            } catch(err) { 
                console.log(err)
            }
        }
    })
})

// Step 4: Visit Schedule - admin side
/*router.get('/step4/:id', getApplication, (req, res) => {
    res.send({applicationStage: res.application.applicationStage})
})*/

// Step 5: Purchase Materials
router.get('/step5/:id', getApplication, async (req, res) => {
    let materials
    try {
        materials = await Material.findOne({connectionType: res.application.connectionType})

        if (materials == null){
            return res.status(404).json({message: 'Cannot find materials'})
        }
        else {
            res.send({materials: materials.materials, applicationNo: res.application.applicationNo})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }
})

// Step 6: Visitation
router.get('/step6/:id', getApplication, async (req, res) => {
    res.application.applicationStage = 'Pending Onsite Visit'

    try {
        const updatedApplication = await res.application.save()
        res.send({applicationNo: updatedApplication.applicationNo})
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// Step 7: Installation
router.get('/step7/:id', getApplication, async (req, res) => {
    res.application.applicationStage = 'Pending Installation'

    try {
        const updatedApplication = await res.application.save()
        res.send({applicationNo: updatedApplication.applicationNo})
    } catch(err){
        res.status(400).json({message: err.message})
    }
})

// Add materials
router.post('/addmaterials', generateMaterialNum, async (req, res) => {
    const materials = new Material ({
        materialNo: res.materialNo,
        connectionType: req.body.connectionType,
        materials: req.body.materials
    })

    try {
        const newMaterials = await materials.save()
        res.json(newMaterials)
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

/* ****************** ASYNC HELPER FUNCTIONS ****************** */
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

    if (clients.length > 0)
        res.clientNum = clients[clients.length-1].clientNo + 1
    else
        res.clientNum = clients.length
    
    if (applications.length > 0)
        res.applicationNum = applications[applications.length-1].applicationNo + 1
    else
        res.applicationNum = applications.length
    
    if (refClient != null)
        res.refClient = refClient._id
    next()
}

async function generateRepNumAndApp(req, res, next) {
    let representatives
    let application

    try {
        representatives = await Representative.find()
        application = await Application.findOne({applicationNo: req.params.id})
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    if (representatives.length > 0)
        res.repNum = representatives[representatives.length-1].idNo + 1
    else
        res.repNum = representatives.length
    

    res.application = application

    next()
}

async function generateMaterialNum(req, res, next) {
    let materials

    try {
        materials = await Material.find()
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    if (materials.length > 0)
        res.materialNo = materials[materials.length-1].materialNo + 1
    else
        res.materialNo = materials.length
    next()
}

async function getApplication(req, res, next) {
    let application 
    try{
        application = await Application.findOne({applicationNo: req.params.id})
        if (application == null){
            return res.status(404).json({message: 'Cannot find application'})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.application = application
    next()
}

async function getClient(req, res, next) {
    let client 
    try{
        client = await Client.findOne({clientNo: req.params.id})
        if (client == null){
            return res.status(404).json({message: 'Cannot find client'})
        }
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.client = client
    next()
}

async function createAppForm(input, output, application) {
    let client
    let refClient

    try {
        client = await Client.findOne({_id: application.applicantNo})
        refClient = await Client.findOne({_id: application.referenceClientNo})

        const pdfDoc = await PDFDocument.load(await readFile(input))

        const fieldNames = pdfDoc.getForm().getFields().map((f) => f.getName())
        console.log(fieldNames)

        const form = pdfDoc.getForm()

        form.getTextField('text_1vizu').setText(application.startDate.toLocaleDateString()) // date
        form.getTextField('text_2qyqy').setText(client.lastName + ", " + client.firstName + ", " + client.middleName) // (last, given, middle)
        form.getTextField('text_3altv').setText(application.establishmentName) // establishment
        form.getTextField('text_4phzg').setText(application.address) // address
        
        if (refClient != null)
            form.getTextField('text_5yvjt').setText(refClient.clientNo.toString()) // ref acc
        
        form.getTextField('text_6xk').setText(application.landmark) // landmark
        form.getTextField('text_7uvjy').setText(client.contactNo) // contact no
        form.getTextField('text_8mjrg').setText(client.email) // email
        form.getTextField('text_9qspa').setText(application.applicationNo.toString()) // application no

        if (application.ownership === "owned")
            form.getCheckBox('checkbox_10nnmb').check() // owned
        else
            form.getCheckBox('checkbox_11jhuz',).check() // leased
        
        if (application.representativeNo != null)
            form.getCheckBox('checkbox_12tcnn').check() // representative

        const pdfBytes = await pdfDoc.save()

        await writeFile(output, pdfBytes)
        console.log("PDF created!")
    } catch (err) {
        console.log(err)
    }
}

async function createAuthLetter(input, output, application) {
    let client
    let representative

    try {
        client = await Client.findOne({_id: application.applicantNo})
        representative = await Representative.findOne({_id: application.representativeNo})

        const pdfDoc = await PDFDocument.load(await readFile(input))

        const fieldNames = pdfDoc.getForm().getFields().map((f) => f.getName())
        console.log(fieldNames)

        const form = pdfDoc.getForm()

        const date = new Date();

        form.getTextField('text_1ikep').setText(date.toLocaleDateString()) // date
        form.getTextField('text_2bbyb').setText(client.firstName + ' ' + client.middleName + ' ' + client.lastName) // client (given middle last)
        form.getTextField('text_3lisc').setText(representative.firstName + ' ' + representative.middleName + ' ' + representative.lastName) // representative (given middle last)
        form.getTextField('text_4vdsg').setText(representative.firstName + ' ' + representative.middleName + ' ' + representative.lastName) // representative (given middle last)
        form.getTextField('text_5pfye').setText(client.firstName + ' ' + client.middleName + ' ' + client.lastName) // client (given middle last)

        const pdfBytes = await pdfDoc.save()

        await writeFile(output, pdfBytes)
        console.log("PDF created!")
    } catch (err) {
        console.log(err)
    }
}

module.exports = router