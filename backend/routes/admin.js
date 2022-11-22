const express = require('express')
const router = express.Router()
const Application = require('../models/application')
const Client = require('../models/client')
const Update = require('../models/update')


//Step 1: Log-in
//Step 3: See all applications - TODO: make it work for when applications button is selected (coming from complaints)
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

