'use strict';
const {createJob} = require('../utils');

/**
 * Finds all pending (stored) jobs
 * @name Agenda#jobs
 * @function
 * @returns {Array} Array of peding jobs
 */
module.exports = async function() {

  const result = await this._db.scan({
    TableName: this.awsConfig.scheduleTable
  }).promise()

  return result.Items.map(job => createJob(this, job));
};
