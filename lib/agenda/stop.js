'use strict';
const debug = require('debug')('agenda:stop');

/**
 * Clear the interval that processes the jobs
 * @name Agenda#stop
 * @function
 * @returns {Promise} resolves when job unlocking fails or passes
 */
module.exports = function() {
  const self = this;
  /**
   * Internal method to unlock jobs so that they can be re-run
   * NOTE: May need to update what properties get set here, since job unlocking seems to fail
   * @access private
   * @returns {Promise} resolves when job unlocking fails or passes
   */
  const _unlockJobs = function() {
    return new Promise((resolve, reject) => {
      debug('Agenda._unlockJobs()');
      const jobIds = self._lockedJobs.map(job => job.attrs.name);

      if (jobIds.length === 0) {
        debug('no jobs to unlock');
        return resolve();
      }
    });
  };

  debug('Agenda.stop called, clearing interval for processJobs()');
  clearInterval(this._processInterval);
  this._processInterval = undefined;
  return _unlockJobs();
};
