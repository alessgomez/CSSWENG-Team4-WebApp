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
                    res.redirect('/admin/applications') 
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

            if (reference != null) {
                refAccNo = reference.clientNo.toString()
                refAccName = reference.firstName + ' ' + reference.middleName + ' ' + reference.lastName
            }
        }

        if (res.application.representativeNo != null) {
            rep = await Representative.findOne({_id: res.application.representativeNo}).lean()
            rep.validId = rep.validId.split('/')[2]
        }
        
        var b1 = false
        var b2 = false
        var b3 = false
        var b4 = false
        var b5 = false
        var b6 = false
        var b7 = false
        var b8 = false
        var b9 = false
        
        switch (res.application.applicationStage) {
            case 'uploading-requirements': b1 = true;
            break;
            
            case 'adding-representative': b2= true;
            break;
            
            case 'printing-and-preparing-documents': b3 = true;
            break;
            
            case 'waiting-for-survey-schedule': b4 = true;
            break;
            
            case 'pending-surveyor-visit': b5 = true;
            break;

            case 'purchasing-of-materials': b6 = true;
            break;

            case 'pending-onsite-visit': b7 = true;
            break;

            case 'pending-installation': b8 = true;
            break;

            case 'completed': b9 = true;
            break;
            
            }
        
        var validId = null;
        
        if (res.application.applicationStage != "uploading-requirements")
            validId = res.application.validId.split('/')[2]

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
            validId: validId,
            applicationStage: res.application.applicationStage,
            representative: rep,
            b1: b1,
            b2: b2,
            b3: b3,
            b4: b4,
            b5: b5,
            b6: b6,
            b7: b7,
            b8: b8,
            b9: b9
        }

        const data = {
            style: ["admin_application_popup"],
            script: ["admin_popup"],
            details: details
        }

        res.render("admin_application_popup", data);
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

        const data = {
            script: ["admin_dashboard"],
            style: ["admin_application_dashboard"],
            stage: "All",
            results: []
        }

        for (var i = 0; i < applications.length; i++)
        {
            var client = await Client.findOne({_id: applications[i].applicantNo})
            
            
            var fullName = client.firstName + " " + client.middleName + " " + client.lastName;
            
            var applicationObj = {
                startDate: (applications[i].startDate.getMonth() + 1) + "/" + applications[i].startDate.getDate() + "/" + applications[i].startDate.getFullYear(),
                applicationNo: applications[i].applicationNo,
                applicationStage: applications[i].applicationStage,
                name: fullName,
                address: applications[i].address,
                contactNo: client.contactNo
            }
            
            data.results.push(applicationObj);
        }
        
        res.render("admin_application_dashboard", data);
    }
    catch(err){
        res.status(500).json({message: err.message})
    }
})

//Step 4d: Search - TODO: assumed to be based on applicant name and app. number ONLY 
//NOTE: Retains latest copy (so not in chronological order based on date)
router.get('/search', async (req, res) => {
     
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

        const data = {
            script: ["admin_dashboard"],
            style: ["admin_application_dashboard"],
            stage: "Search Results",
            results: []
        }

        for (var i = 0; i < uniqResults.length; i++)
        {
            var client = await Client.findOne({_id: uniqResults[i].applicantNo})
            
            
            var fullName = client.firstName + " " + client.middleName + " " + client.lastName;

            var applicationObj = {
                startDate: uniqResults[i].startDate.getMonth() + "/" + uniqResults[i].startDate.getDate() + "/" + uniqResults[i].startDate.getFullYear(),
                applicationNo: uniqResults[i].applicationNo,
                applicationStage: uniqResults[i].applicationStage,
                name: fullName,
                address: uniqResults[i].address,
                contactNo: client.contactNo
            }

            data.results.push(applicationObj);
        }

        res.render('partials\\approw', data.results, function(err, html) {
            if (err)
            {
                throw err;
            } 
            console.log("HTML: " + html);
            res.send(html);
        });

        //res.json(uniqResults)
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

            const referencedBy = await Application.find({referenceClientNo: applicantNo})

            if (referencedBy.length > 0) // Client is used as reference by other applicants
                for (i=0; i < referencedBy.length; i++) {
                    referencedBy[i].referenceClientNo = null
                    await referencedBy[i].save()
                }
        }
        
        res.json({message: "Deleted Application"})
    } catch(err) {
        res.status(500).json({message: err.message})
    }
})

//Step ?: Status filter - NOTE: Need to test
router.get('/filter', async (req, res) => {
    try {
        let applications

        if (req.query.stage === "all")
        {
            applications = await Application.find()
        }
        else
        {
            applications = await Application.find({applicationStage: req.query.stage})
        }   
       
        const data = {
            script: ["admin_dashboard"],
            style: ["admin_application_dashboard"],
            stage: "all",
            results: []
        }

        for (var i = 0; i < applications.length; i++)
        {
            var client = await Client.findOne({_id: applications[i].applicantNo})
            
            
            var fullName = client.firstName + " " + client.middleName + " " + client.lastName;

            var applicationObj = {
                startDate: applications[i].startDate.getMonth() + "/" + applications[i].startDate.getDate() + "/" + applications[i].startDate.getFullYear(),
                applicationNo: applications[i].applicationNo,
                applicationStage: applications[i].applicationStage,
                name: fullName,
                address: applications[i].address,
                contactNo: client.contactNo
            }

            data.results.push(applicationObj);
        }

        res.render('partials\\approw', data.results, function(err, html) {
            if (err)
            {
                throw err;
            } 
            console.log("HTML: " + html);
            res.send(html);
        });
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Step 5 xiv 3a: Employee is asked to input the survey schedule
router.get('/surveyschedule/:id',  getApplication, async (req, res) => {
    res.application.surveySchedule = new Date(req.query.date + "T" + req.query.time + ":00" + "Z");
    
    try {
        const updatedApplication = await res.application.save()
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
        res.send({applicationNo: updatedApplication.applicationNo})
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Step 5 xiv: Status change from dropdown + Step 6 (if application is completed): Completion date is stored 
router.patch('/updatestatus/:id', getApplication, generateUpdateNum, async (req, res) => {
    res.application.applicationStage = req.body.newStatus
    if (req.body.newStatus == "Completed" || req.body.newStatus == "completed")
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

    if (employees.length > 0)
        res.employeeNo = employees[employees.length-1].employeeNo + 1
    else
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

    if (updates.length > 0)
        res.updateNo = updates[updates.length-1].updateNo + 1
    else
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