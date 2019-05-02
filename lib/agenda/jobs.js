'use strict';
const {createJob} = require('../utils');

/**
 * Finds all jobs matching 'query'
 * @name Agenda#jobs
 * @function
 * @param {Object} query object for MongoDB
 * @returns {Promise} resolves when fails or passes
 */
module.exports = async function() {

  const result = await this._db.scan({
    TableName: this.awsConfig.scheduleTable
  }).promise()

  return result.Items.map(job => createJob(this, job));
};
