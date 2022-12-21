const express = require('express')
const router = express.Router()

router.post('/deposit/:userId',async (req, res) =>{
    const {Profile } = req.app.get('models')
    const {userId} = req.params
    const {amount} = req.body

    try {
      await Profile.depositTo(userId, amount)

      res.status(201).json({userId})
    } catch (error) {
      res.status(422).json({error: error.message})
    }
    
})

module.exports = router