const Sequelize = require('sequelize');

let storage = './database.sqlite3';
if(process.env.NODE_ENV === 'test') {
  storage = './database.test.sqlite3';
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage
});

class Profile extends Sequelize.Model {
  static async depositTo(userId, amount) {
    const profile = await Profile.findByPk(userId, {
      attributes: [
        [sequelize.fn('SUM', sequelize.col('Client.Jobs.price')), 'totalToPaid']
      ],
      include: [{
        model: Contract,
        as: 'Client',
        include: [{ model: Job, where: { paid: false }, attributes: [] }]
      }]
    })
    if (!profile) {
      throw Error('Not found')
    }

    const { totalToPaid } = profile.dataValues
    const allowToDeposit = totalToPaid * 0.25
    if(allowToDeposit < amount) {
      throw Error('Amount not allowed')
    }

    await Profile.increment({ balance: amount}, { where: { id: userId }} )
  }

  async getContractorById(id) {
    const contractors = await this.getContractor({where: {id}})
    return contractors.length !== 0  
      ? contractors[0]
      : null
  }

  async getNonTerminatedContractors() {
    return this.getContractor({ where: { status: {  [Sequelize.Op.ne]: 'terminated' }} })
  }

  async getUnpaidJobs() {
    return this.getContractor({
      where: { status: 'in_progress'},
      include: [{model: Job, where: { paid: false }}]
    })
  }
}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance:{
      type:Sequelize.DECIMAL(12,2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

class Contract extends Sequelize.Model {}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status:{
      type: Sequelize.ENUM('new','in_progress','terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

class Job extends Sequelize.Model {
  static async findUnpaidByProfileId(profileId) {
    return Job.findAll({
      include: [{
        model: Contract,
        where: {
          status: 'in_progress',
          [Sequelize.Op.or]: [
            { ClientId: profileId },
            { ContractorId: profileId },
          ]
        }
      }],
      where: { paid: false }
    });
  }

  async markAsPaid() {
    if (this.paid) return;

    const t = await sequelize.transaction()
    const contract = this.Contract || await this.getContract()
    try {
      await Profile.decrement({ balance: this.price}, { where: { id: contract.ClientId }, transaction: t } )
      await Profile.increment({ balance: this.price}, { where: { id: contract.ContractorId }, transaction: t} )
      this.paid = true;
      this.paymentDate = new Date()
      await this.save({transaction: t})
      await t.commit()
    } catch (error) {
      console.error(error);
      await t.rollback()
      throw error
    }
  }
}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price:{
      type: Sequelize.DECIMAL(12,2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default:false
    },
    paymentDate:{
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

Profile.hasMany(Contract, {as :'Contractor',foreignKey:'ContractorId'})
Contract.belongsTo(Profile, {as: 'Contractor'})
Profile.hasMany(Contract, {as : 'Client', foreignKey:'ClientId'})
Contract.belongsTo(Profile, {as: 'Client'})
Contract.hasMany(Job)
Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  Contract,
  Job
};
