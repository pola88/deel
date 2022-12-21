const express = require('express')
const router = express.Router()
const { Op } = require('sequelize')

router.get('/best-profession',async (req, res) =>{
    const {Profile, Contract, Job } = req.app.get('models')
    const sequelize = req.app.get('sequelize')
    const {start, end} = req.query
    if(!start || !end) {
      return res.status(422).json({ error: 'Missing dates'})
    }

    try {
      const profiles = await Profile.findAll({
        attributes: [
          'Profile.profession',
          [sequelize.fn('SUM', sequelize.col('Contractor.Jobs.price')), 'totalEarned']
        ],
        group: 'Profile.profession',
        include: [{
          required: true,
          model: Contract,
          as: 'Contractor',
          include: [{
            required: true,
            model: Job,
            where: {
              paid: true,
              createdAt: {
                [Op.and]: {
                  [Op.gte]: start,
                  [Op.lte]: end
                }
              }
            },
          }]
        }],
        order: [['totalEarned', 'DESC'], ['profession', 'DESC']],
        raw: true
      })
      const response = profiles.map( profile => ({
        profession: profile.profession,
        earned: profile.totalEarned
      }))

      res.status(200).json(response)
    } catch (error) {
      console.log(error);
      res.status(422).json({error: error.message})
    }
    
})

module.exports = router