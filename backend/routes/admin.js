const express = require('express')
const { db } = require('../models/application')
const router = express.Router()
const Application = require('../models/application')
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

router.get('/applications/test', async (req, res) => {
     
    try{
        const hannah = await Client.find({$text: {$search:"reg"}})
        res.json(hannah)
    }
    catch (err){
        res.status(500).json({message: err.message})
    }
    
})

//Step 4d: Search - TODO: assumed to be based on applicant name and app. number ONLY 
router.get('/applications/search', async (req, res) => {

    try{
        q = req.query.q

        const results = await Client.find({$or: [{firstName: q}, {middleName: q}, {lastName: q}]}, {_id: 1}) 

        try {

        }
        catch(err){

        }

        //{ field: { $in: [<value1>, <value2>, ... <valueN> ] } }

    }
    catch(err){ 
        res.status(500).json({message: err.message}) //TODO check if correct status code
    }
})

//Step 4e: Option to delete an application

//Step 5 xiv: Status change from dropdown 


//Step 5 xiv 3a: Employee is asked to input the survey schedule

//Step 5 xiv 6a: Employee is asked to input the installation schedule  

//Step 6? (completion): Completion date is stored 

















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