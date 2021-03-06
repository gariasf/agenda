const {EventEmitter} = require('events');
const humanInterval = require('human-interval');

/**
 * @class Agenda
 * @param {Object} config - Agenda Config
 * @param {Function} cb - Callback after Agenda has started and connected to mongo
 * @property {Object} _name - Name of the current Agenda queue
 * @property {Number} _processEvery
 * @property {Number} _defaultConcurrency
 * @property {Number} _maxConcurrency
 * @property {Number} _defaultLockLimit
 * @property {Number} _lockLimit
 * @property {Object} _definitions
 * @property {Object} _runningJobs
 * @property {Object} _lockedJobs
 * @property {Object} _jobQueue
 * @property {Number} _defaultLockLifetime
 * @property {Object} _sort
 * @property {Object} _indices
 * @property {Boolean} _isLockingOnTheFly
 * @property {Array} _jobsToLock
 */
class Agenda extends EventEmitter {
  constructor(awsConfig) {
    super();

    if (!(this instanceof Agenda)) {
      return new Agenda(awsConfig);
    }

    this._processEvery = humanInterval('5 seconds');
    this._defaultConcurrency = 5;
    this._maxConcurrency = 20;
    this._defaultLockLimit = 0;
    this._lockLimit = 0;
    this._definitions = {};
    this._runningJobs = [];
    this._lockedJobs = [];
    this._jobQueue = [];
    this._defaultLockLifetime = 10 * 60 * 1000; // 10 minute default lockLifetime
    this._sort = {nextRunAt: 1, priority: -1};
    this._indices = Object.assign({name: 1}, this._sort, {priority: -1, lockedAt: 1, nextRunAt: 1, disabled: 1});

    this._isLockingOnTheFly = false;
    this._jobsToLock = [];
    this._ready = new Promise(resolve => this.once('ready', resolve));

    this.database(awsConfig);
  }
}

Agenda.prototype.database = require('./database');
Agenda.prototype.name = require('./name');
Agenda.prototype.processEvery = require('./process-every');
Agenda.prototype.maxConcurrency = require('./max-concurrency');
Agenda.prototype.defaultConcurrency = require('./default-concurrency');
Agenda.prototype.lockLimit = require('./locklimit');
Agenda.prototype.defaultLockLimit = require('./default-lock-limit');
Agenda.prototype.defaultLockLifetime = require('./default-lock-lifetime');
Agenda.prototype.sort = require('./sort');
Agenda.prototype.create = require('./create');
Agenda.prototype.jobs = require('./jobs');
Agenda.prototype.define = require('./define');
Agenda.prototype.every = require('./every');
Agenda.prototype.schedule = require('./schedule');
Agenda.prototype.now = require('./now');
Agenda.prototype.cancel = require('./cancel');
Agenda.prototype.saveJob = require('./save-job');
Agenda.prototype.start = require('./start');
Agenda.prototype.stop = require('./stop');
Agenda.prototype._findAndLockNextJob = require('./find-and-lock-next-job');

module.exports = Agenda;
