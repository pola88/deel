const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')

router.use(getProfile);

router.get('/',async (req, res) =>{
    const profile = req.profile;
    const contracts = await profile.getNonTerminatedContractors()
    res.json(contracts)
})

router.get('/:id' ,async (req, res) =>{
    const profile = req.profile;
    const {id} = req.params
    const contract = await profile.getContractorById(id)
    if(!contract) return res.status(404).end()
    res.json(contract)
})

module.exports = router
