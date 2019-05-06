'use strict';
const debug = require('debug')('agenda:saveJob');
const {processJobs} = require('../utils');

/**
 * Determine whether to process the job immediately or to let the processJobs() interval pick it up later
 * @param {*} result the data returned from the db operation
 * @access private
 * @returns {undefined}
 */
const processDbResult = (job, result) => {
  debug('processDbResult() called with success, checking whether to process job immediately or not');

  if (result) {
    // Grab ID and nextRunAt from Dynamodb and store it as an attribute on Job
    job.attrs.name = result.Attributes.name;
    job.attrs.nextRunAt = result.Attributes.nextRunAt;

    // If the current job would have been processed in an older scan, process the job immediately
    if (job.attrs.nextRunAt && job.attrs.nextRunAt < this._nextScanAt) {
      debug('[%s] job would have ran by nextScanAt, processing the job immediately', job.attrs.name);
      processJobs.call(this, job);
    }
  }

  // Return the Job instance
  return job;
};

/**
 * Save the properties on a job to DynamoDB
 * @name Agenda#saveJob
 * @function
 * @param {Job} job job to save into DynamoDB
 * @returns {Promise} resolves when job is saved or errors
 */
module.exports = async function(job) {
  try {
    debug('attempting to save a job into Agenda instance');

    // Grab information needed to save job but that we don't want to persist in MongoDB
    const jobName = job.attrs.name;
    const {unique, uniqueOpts} = job.attrs;

    // Store job as JSON and remove props we don't want to store from object
    const props = job.toJSON();
    // delete props.name;
    delete props.unique;
    delete props.uniqueOpts;

    // Store name of agenda queue as last modifier in job data
    debug('[job %s] set job props: \n%O', jobName, props);

    // Grab current time and set default query options for MongoDB
    const now = new Date();
    debug('current time stored as %s', now.toISOString());

    // If the job already had a name, then update the properties of the job
    // i.e, who last modified it, etc
    if (jobName) {
      // Update the job and process the resulting data'
      debug('job already has name, calling findOneAndUpdate() using name as query');
      const result = await this._db.update({
        TableName: this.awsConfig.scheduleTable,
        Key: {
          name: jobName
        },
        AttributeUpdates: {
          data: {Action: "PUT", Value: props.data},
          nextRunAt: {Action: "PUT", Value: props.nextRunAt.getTime()}
        },
        ReturnValues: "ALL_NEW"
      }).promise()

      return processDbResult(job, result);
    }

    // If all else fails, the job does not exist yet so we just insert it into DynamoDB
    debug('using default behavior, inserting new job via insertOne() with props that were set: \n');

    const result = await this._db.put({
      TableName: this.awsConfig.scheduleTable,
      Item: props,
    }).promise();


    return processDbResult(job, result.params.Item);
  } catch (err) {
    debug('processDbResult() received an error, job was not updated/created', err);
    throw err;
  }
};
