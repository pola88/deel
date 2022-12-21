const express = require('express')
const router = express.Router()
const { Op, QueryTypes } = require('sequelize')

router.get('/best-client',async (req, res) =>{
    const sequelize = req.app.get('sequelize')
    const {start, end, limit = 2} = req.query
    if(!start || !end) {
      return res.status(422).json({ error: 'Missing dates'})
    }

    try {
      const profiles = await sequelize.query(`
        SELECT
          Profiles.id,
          Profiles.firstName || ' ' || Profiles.lastName as fullName,
          SUM(Jobs.price) as paid
        FROM Profiles
          JOIN Contracts
            ON Contracts.ClientId = Profiles.id
          JOIN Jobs
            ON Jobs.ContractId = Contracts.id
            AND Jobs.paid = true
            AND Jobs.createdAt >= :start
            AND Jobs.createdAt <= :end
        GROUP BY Profiles.id
        ORDER BY paid DESC
        LIMIT :limit;
      `, {
        type: QueryTypes.SELECT,
        raw: true,
        replacements: { start, end, limit }
      });

      res.status(200).json(profiles)
    } catch (error) {
      console.log(error);
      res.status(422).json({error: error.message})
    }
    
})

module.exports = router