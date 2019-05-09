'use strict';
const DynamoDB = require('aws-sdk').DynamoDB
const AWS = require('aws-sdk/global')

/**
 * Connect to Dynamodb database.
 * @name Agenda#database
 * @function
 * @param {Object}
 * @returns {exports}
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
