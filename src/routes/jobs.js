const express = require('express')
const router = express.Router()
const {getProfile} = require('../middleware/getProfile')

router.use(getProfile);

router.get('/unpaid',async (req, res) =>{
  const profile = req.profile;
  const {Job} = req.app.get('models')
  const unpaidJobs = await Job.findUnpaidByProfileId(profile.id)
  res.json(unpaidJobs)
})

router.post('/:jobId/pay', async (req, res) => {
  const profile = req.profile;
  const {jobId} = req.params
  const {Job, Contract } = req.app.get('models')
  const job = await Job.findByPk(jobId, {
    include: Contract
  })

  if (profile.balance >= job.price) {
    try {
      await job.markAsPaid();
      return res.status(201).json(job)
    } catch (error) {
      console.error(error);
      return res.status(500).end()
    }
  }

  return res.status(422).json({ error: 'Insufficient balance'})
})

module.exports = router