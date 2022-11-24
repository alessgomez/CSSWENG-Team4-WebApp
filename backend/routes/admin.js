const express = require('express')
const { db } = require('../models/application')
const router = express.Router()
const Application = require('../models/application')
const Client = require('../models/client')
const Update = require('../models/update')

/*URL:
http://localhost:3000/admin
*/

//Step 1: Log-in
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



module.exports = router

