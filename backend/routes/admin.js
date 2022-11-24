const express = require('express')
const { db } = require('../models/application')
const router = express.Router()
const Application = require('../models/application')
const client = require('../models/client')
const Client = require('../models/client')
const Update = require('../models/update')
const Employee = require('../models/employee')
const bcrypt = require("bcryptjs");

/*URL:
http://localhost:3000/admin
*/

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
    } catch(err) {
        res.status(400).json({message: err.message})
    }
})

// Step 1: Login
router.post('/login', async(req, res) => {
    let employee
    try {
        employee = await Employee.findOne({username: req.body.username})

        if (employee == null)
                return res.status(404).json({message: 'Cannot find employee'})
        else
            bcrypt.compare(req.body.password, employee.password, (err, result) => {
                if (!result)
                    return res.status(404).json({message: 'Incorrect password'})
                else {
                    req.session.user = employee.employeeNo;
                    req.session.name = employee.firstName + " " + employee.middleName + " " + employee.lastName;
                    res.send({session: req.session})
                }
            })
    } catch(err) {
        return res.status(500).json({message: err.message})
    }
})

// Step 1 Bonus: Logout
router.post('/logout', async(req, res) => {
    if (req.session)
        {
            req.session.destroy(() => {
                res.clearCookie('connect.sid');
                res.send({message: 'Session successfully deleted!'});
            });
        }
})

//Step 4: See all applications - TODO: make it work for when applications button is selected (coming from complaints)
router.get('/applications', async (req, res) => {
    
    try{
        const applications = await Application.find()
        res.json(applications)
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


//Step 5 xiv 6a: Employee is asked to input the installation schedule  

//Step 5 xiv: Status change from dropdown (aless) + //Step 6? (completion): Completion date is stored 

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















//Step 5: Return selected applicant (initial action)
router.get('/applications/:id', async (req, res) => {

})

//Step 5 xiv 3: Visitation date 
router.patch('/applications/:id', async (req, res) => {
    //add visitation date
})

//Step 5 xiv 6a: Installation date 
router.patch('/applications/:id', async (req, res) => {
    //add installation date
})

//Step 5: Updating the stage (general)
router.patch('/applications/:id', async (req, res) => {
    //udpate stage of application 
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

module.exports = router