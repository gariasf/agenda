'use strict';
const debug = require('debug')('agenda:job');

/**
 * Internal method (RUN)
 * @name Job#run
 * @function
 * @returns {Promise} Resolves when job persistence in DynamoDB fails or passes
 */
module.exports = function() {
  const self = this;
  const {agenda} = self;
  const definition = agenda._definitions[self.attrs.name];

  return new Promise(async(resolve, reject) => {
    self.attrs.lastRunAt = new Date();
    debug('[%s:%s] setting lastRunAt to: %s', self.attrs.name, self.attrs.name, self.attrs.lastRunAt.toISOString());
    self.computeNextRunAt();

    const jobCallback = async err => {
      if (err) {
        self.fail(err);
      } else {
        self.attrs.lastFinishedAt = new Date();
      }

      self.attrs.lockedAt = null;

      if (err) {
        agenda.emit('fail', err, self);
        agenda.emit('fail:' + self.attrs.name, err, self);
        debug('[%s] has failed [%s]', self.attrs.name, err.message);
      } else {
        agenda.emit('success', self);
        agenda.emit('success:' + self.attrs.name, self);
        debug('[%s:%s] has succeeded', self.attrs.name, self.attrs.name);
      }
      agenda.emit('complete', self);
      agenda.emit('complete:' + self.attrs.name, self);
      debug('[%s] job finished at [%s] and was unlocked', self.attrs.name, self.attrs.lastFinishedAt);
      // Curiously, we still resolve successfully if the job processor failed.
      // Agenda is not equipped to handle errors originating in user code, so, we leave them to inspect the side-effects of job.fail()
      resolve(self);
    };

    try {
      agenda.emit('start', self);
      agenda.emit('start:' + self.attrs.name, self);
      debug('[%s] starting job', self.attrs.name);
      if (!definition) {
        debug('[%s] has no definition, can not run', self.attrs.name);
        throw new Error('Undefined job');
      }
      if (definition.fn.length === 2) {
        debug('[%s] process function being called', self.attrs.name);
        definition.fn(self, jobCallback);
      } else {
        debug('[%s] process function being called', self.attrs.name);
        definition.fn(self);
        await jobCallback();
      }
    } catch (err) {
      debug('[%s] unknown error occurred', self.attrs.name);
      await jobCallback(err);
    }
  });
};
