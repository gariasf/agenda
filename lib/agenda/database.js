'use strict';
const DynamoDB = require('aws-sdk').DynamoDB

const AWS = require('aws-sdk/global')

// AWS.config.setPromisesDependency(null);


/**
 * Connect to the spec'd MongoDB server and database.
 * @name Agenda#database
 * @function
 * @param {String} url MongoDB server URI
 * @param {String} collection name of collection to use. Defaults to `agendaJobs`
 * @param {Object} options options for connecting
 * @param {Function} cb callback of MongoDB connection
 * @returns {exports}
 * NOTE:
 * If `url` includes auth details then `options` must specify: { 'uri_decode_auth': true }. This does Auth on
 * the specified database, not the Admin database. If you are using Auth on the Admin DB and not on the Agenda DB,
 * then you need to authenticate against the Admin DB and then pass the MongoDB instance into the constructor
 * or use Agenda.mongo(). If your app already has a MongoDB connection then use that. ie. specify config.mongo in
 * the constructor or use Agenda.mongo().
 */
module.exports = function (awsConfig) {
  const self = this;

  const dynamoConfig = {
    endpoint: `https://dynamodb.${awsConfig.region}.amazonaws.com`,
    region: awsConfig.region,
  }

  if (awsConfig.profile) {
    this.aws = new AWS.Config()
    this.aws.credentials = new AWS.SharedIniFileCredentials({
      profile: awsConfig.profile,
    })

    dynamoConfig.credentials = this.aws.credentials
  }

  const dynamo = new DynamoDB.DocumentClient(dynamoConfig)



  self.awsConfig = awsConfig
  self._db = dynamo;
  self.emit('ready');




  return this;
};
