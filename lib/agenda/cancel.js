'use strict';
const debug = require('debug')('agenda:cancel');

/**
 * Cancels the jobs matching the passed name, and removes it from the database.
 * @name Agenda#cancel
 * @function
 * @param {string} jobName Job name query to use when cancelling
 * @caller client code, Agenda.purge(), Job.remove()
 * @returns {Promise<Number>} A promise that contains the number of removed documents when fulfilled.
 */
module.exports = async function(jobName) {
  debug('attempting to cancel all Agenda jobs', jobName);
  try {

    var params = {
      RequestItems: {
        [this.awsConfig.scheduleTable]: [
          {
            DeleteRequest: {
              Key: {
                "name": jobName
              }
            }
          },
        ],
      }
    };

    const result = await this._db.batchWrite(params, function(err, data) {
      if (err) {
        debug(err); // an error occurred
      } else {
        return data; // successful response
      }
    }).promise();

    debug('%s jobs cancelled', result);
    return result;
  } catch (err) {
    debug('error trying to delete jobs from DynamoDB');
    throw err;
  }
};
