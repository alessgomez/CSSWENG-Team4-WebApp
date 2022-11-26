const express = require('express')
const router = express.Router()
const Application = require('../models/application')
const Representative = require('../models/representative')
const Client = require('../models/client')
const Update = require('../models/update')
const Employee = require('../models/employee')
const bcrypt = require("bcryptjs")
const path = require('path')

/*URL:
http://localhost:3000/admin
*/

// Render login page
router.get('/getLogin', (req, res) => {
    res.render('admin_login', {layout: false})
})

// Render dashboard
router.get('/dashboard', (req, res) => {
    res.render('admin_application_dashboard')
})

// Step 1 Prerequisite: Add Employee Credentials
router.post('/addcredentials', generateEmployeeNum, async (req, res) => {
    const employee = new Employee ({
        employeeNo: res.employeeNo,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        contactNo: req.body.contactNo,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    })

    try {
        bcrypt.hash(employee.password, 10, async (err, hashed) => {
            if (!err)
                employee.password = hashed
            
            const newEmployee = await employee.save()
            res.json(newEmployee)
        })
    } catch (err) {
        res.status(400).json({message: err.message})
    }
})

// Step 1: Login
router.post('/login', async(req, res) => {
    let employee
    try {
        employee = await Employee.findOne({username: req.body.uname})

        if (employee == null)
                return res.status(404).json({message: 'Cannot find employee'})
        else
            bcrypt.compare(req.body.password, employee.password, (err, result) => {
                if (!result)
                    return res.status(404).json({message: 'Incorrect password'})
                else {
                    req.session.objectId = employee._id
                    req.session.user = employee.employeeNo;
                    req.session.name = employee.firstName + " " + employee.middleName + " " + employee.lastName;
                    res.redirect('/admin/dashboard')
                }
            })
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

// Step 1 Bonus: Logout
router.post('/logout', async(req, res) => {
    try {
        if (req.session.name == null)
            res.send({message: 'No existing session!'})
        else {
            req.session.destroy(() => {
                res.clearCookie('connect.sid')
                res.send({message: 'Session successfully deleted!'})
            })
        }
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

// Step 2: Displaying application details based on selection - POP UP
router.get('/applications/:id', getApplication, async (req, res) => {
    try {
        const client = await Client.findOne({_id: res.application.applicantNo})
        var reference = null, rep = null
        var refAccNo = "", refAccName = ""

        if (res.application.referenceClientNo != null) {
            reference = await Client.findOne({_id: res.application.referenceClientNo})
            refAccNo = reference.clientNo
            refAccName = reference.firstName + ' ' + reference.middleName + ' ' + reference.lastName
        }

        if (res.application.representativeNo != null)
            rep = await Representative.findOne({_id: res.application.representativeNo})
        
        const details = {
            applicationNo: res.application.applicationNo,
            fullName: client.firstName + ' ' + client.middleName + ' ' + client.lastName,
            submissionDate: res.application.startDate,
            email: client.email,
            establishmentName: res.application.establishmentName,
            contactNo: client.contactNo,
            address: res.application.address,
            refAccountNo: refAccNo,
            refAccountName: refAccName,
            landmark: res.application.landmark,
            ownership: res.application.ownership,
            validId: res.application.validId,
            representative: rep
        }

        res.send(details)
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

// Step 2a: Download valid ID based on link displayed in details
router.get('/applications/:id/:filename', async (req, res) => {
    try {
        res.download(path.resolve(__dirname, '../public/validIds/' + req.params.filename), async function(err) {
            if (err)
                console.log(err)
        })
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
})

//Step 4: See all applications - TODO: make it work for when applications button is selected (coming from complaints)
router.get('/applications', async (req, res) => {
    
    try{
        const applications = await Application.find()
        //console.log(applications);

        /*const data = {
            stage: "All",
            results: []
        }

        for (var i = 0; i < applications.length; i++)
        {
            var client = await Client.findOne({_id: applications[i].applicantNo})
            
            
            //var fullName = client.firstName + " " + client.middleName + " " + client.lastName;

            var applicationObj = {
                startDate: applications[i].startDate,
                applicationNo: applications[i].applicationNo,
                applicationStage: applications[i].applicationStage,
                name: fullName,
                address: applications[i].address,
                contactNo: client.contactNo
            }

            data.results.push(applicationObj);
        }*/

        res.render("admin_application_dashboard");
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//Step 4d: Search - TODO: assumed to be based on applicant name and app. number ONLY 
//NOTE: Retains latest copy (so not in chronological order based on date)
router.get('/applications/search', async (req, res) => {
     
    try{
        let clientAppResult = []
        let allResults = []
        console.log("11111 updated " + isNaN(req.query.search) + " " + req.query.search)

        const clientNameResult = await Client.find({$text: {$search: req.query.search}}) //client name 
        console.log("clientNameResult: " + clientNameResult)
        
        for (var i = 0; i < clientNameResult.length; i++)
            clientAppResult = clientAppResult.concat(await Application.find({applicantNo: clientNameResult[i]._id})) 
        
        if (typeof clientAppResult != "undefined" && clientAppResult.length != 0)
        {
            allResults = allResults.concat(clientAppResult)
            console.log("22222 *" + typeof clientAppResult + "*") //undefined            
        }
        
        const addressResult = await Application.find({$text: {$search: req.query.search}}) //address
        if (typeof addressResult != "undefined" && addressResult.length != 0)
        {
            allResults = allResults.concat(addressResult)
            console.log("33333 *" + typeof addressResult + "*") //object
        }

        if (isNaN(req.query.search) == false)
        {
            const appNoResult = await Application.find({applicationNo: req.query.search}) //application number
            if (typeof appNoResult != "undefined" && appNoResult.length != 0)
            {
                allResults = allResults.concat(appNoResult)
                console.log("44444 *" + allResults.length + "*")
            }
        }

        const uniqResults = [...allResults.reduce((map, obj) => map.set(obj.applicationNo, obj), new Map()).values()]  //NOTE: Retains latest copy (so not in chronological order based on date)

        res.json(uniqResults)
    }
    catch (err){
        res.status(500).json({message: err.message})
    }
})

//Step 4e: Option to delete an application
//NOTE: Test if a client has another existing application (if it will get deleted)
router.delete('/applications/delete/:id', getApplication, async (req, res) => {
    let applicantNo
    try{
        applicantNo = res.application.applicantNo
        
        console.log("PASOK")

        await res.application.remove()

        console.log("applicantNo type: " + typeof applicantNo + " | itself: " + applicantNo)

        const otherApp = await Application.find({applicantNo: applicantNo})
        
        console.log("type: " + typeof otherApp + " | itself: " + otherApp)

        if (otherApp.length == 0) //no other applications under this client
        {
            const client = await Client.findOne({_id: applicantNo})
            console.log("type: " + typeof client + " | itself: " + client)
            await client.remove()
        }
        
        res.json({message: "Deleted Application"})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

//Step ?: Status filter - NOTE: Need to test
router.get('/applications/filter', async (req, res) => {
    try {
        const applications = await Application.find({applicationStage: req.query.stage})
        
        res.json(applications)
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Step 5 xiv 3a: Employee is asked to input the survey schedule
router.get('/surveyschedule/:id',  getApplication, async (req, res) => {
    res.application.surveySchedule = new Date(req.query.date + "T" + req.query.time + ":00" + "Z");
    
    try {
        const updatedApplication = await res.application.save()
        console.log("updatedApplication: " + updatedApplication)
        res.send({applicationNo: updatedApplication.applicationNo})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Step 5 xiv 6a: Employee is asked to input the installation schedule  
router.get('/installationschedule/:id',  getApplication, async (req, res) => {
    res.application.installationSchedule = new Date(req.query.date + "T" + req.query.time + ":00" + "Z");
    
    try {
        const updatedApplication = await res.application.save()
        console.log("updatedApplication: " + updatedApplication)
        res.send({applicationNo: updatedApplication.applicationNo})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Step 5 xiv: Status change from dropdown + Step 6 (if application is completed): Completion date is stored 
router.patch('/updatestatus/:id', getApplication, generateUpdateNum, async (req, res) => {
    res.application.applicationStage = req.body.newStatus

    if (req.body.newStatus == "Completed")
        res.application.completionDate = Date.now ()

    const update = new Update ({
        updateNo: res.updateNo,
        updatedBy: req.session.objectId,
        applicationNo: res.application._id,
        newStage: req.body.newStatus
    })

    try {
        const updatedApplication = await res.application.save()
        const newUpdate = await update.save()
        res.send({newUpdate})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

/* ****************** ASYNC HELPER FUNCTIONS ****************** */
async function generateEmployeeNum(req, res, next) {
    let employees

    try {
        employees = await Employee.find()
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.employeeNo = employees.length
    next()
}

async function generateUpdateNum(req, res, next) {
    let updates

    try {
        updates = await Update.find()
    } catch(err) {
        return res.status(500).json({message: err.message})
    }

    res.updateNo = updates.length
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

module.exports = router