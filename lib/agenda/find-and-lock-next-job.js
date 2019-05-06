'use strict';
const debug = require('debug')('agenda:internal:_findAndLockNextJob');
const {
  createJob
} = require('../utils');

/**
 * Find and lock jobs
 * @name Agenda#findAndLockNextJob
 * @function
 * @param {String} jobName name of job to try to lock
 * @param {Object} definition definition used to tell how job is run
 * @param {Function} cb called when job lock fails or passes
 * @caller jobQueueFilling() only
 * @returns {undefined}
 */
module.exports = function (jobName, definition, cb) {
  const self = this;
  const now = new Date();
  const lockDeadline = new Date(Date.now().valueOf() - definition.lockLifetime);
  debug('_findAndLockNextJob(%s, [Function], cb)', jobName);


  this._db.update({
      "TableName": self.awsConfig.scheduleTable,
      "Key": {
        name: jobName,
      },
      "UpdateExpression": "SET lockedAt = :now",
      "ConditionExpression": "(nextRunAt <= :nextScan OR lockedAt <= :lockDeadline) AND attribute_not_exists(lockedAt)",
      "ExpressionAttributeValues": {
          ":now": now.getTime(),
          ":nextScan": this._nextScanAt.getTime(),
          ":lockDeadline": lockDeadline.getTime()
      },
      "ReturnValues": "ALL_NEW"
    }).promise()
    .then(result => {
      debug('found a job available to lock, creating a new job on Agenda with name [%s]', JSON.stringify(result.Attributes.name));

      let job = createJob(self, result.Attributes);

      // We can't pass the error as it is, so we send null
      cb(null, job);
    })
    .catch(err => {
      if(err.message == "The conditional request failed") {
        // Dynamodb throws an error if the ConditionExpression is not met, but we can't break here. Failt silenty
        return
      } 

      debug('Dynamodb threw an error, what a surprise: ', err);
    })
};
