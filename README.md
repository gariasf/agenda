<p align="center">
  <img src="https://cdn.rawgit.com/agenda/agenda/master/agenda.svg" alt="Agenda" width="100" height="100">
</p>
<p align="center">
  A light-weight job scheduling library for Node.js
</p>
<p align="center">

</p>

# Aws-agenda offers

- Minimal overhead. Agenda aims to keep its code base small.
- DynamoDB backed persistence layer.
- Promises based API.
- Scheduling.
- Event backed job queue that you can hook into.

### Feature Comparison

Since there are a few job queue solutions, here a table comparing them to help you use the one that
better suits your needs.

Agenda is great if you need something that is simple and backed by DynamoDB.

| Feature         | Bull          | Kue   | Bee | Agenda | Agenda AWS |
| :-------------  |:-------------:|:-----:|:---:|:------:|:----------:|
| Backend         | redis         | redis |redis| mongo  | DynamoDB   |
| Priorities      | ✓             |  ✓    |     |   ✓    |           |
| Concurrency     | ✓             |  ✓    |  ✓  |   ✓    |   ✓       |
| Delayed jobs    | ✓             |  ✓    |     |   ✓    |   ✓       |
| Global events   | ✓             |  ✓    |     |        |           |
| Rate Limiter    | ✓             |       |     |        |            |
| Pause/Resume    | ✓             |  ✓    |     |        |           |
| Sandboxed worker| ✓             |       |     |        |            |
| Repeatable jobs | ✓             |       |     |   ✓    |           |
| Atomic ops      | ✓             |       |  ✓  |        |           |
| Persistence     | ✓             |   ✓   |  ✓  |   ✓    |   ✓      |
| UI              | ✓             |   ✓   |     |   ✓    |           |
| REST API        |               |       |     |   ✓    |            |
| Optimized for   | Jobs / Messages | Jobs | Messages | Jobs | Jobs |

_Kudos for making the comparison chart goes to [Bull](https://www.npmjs.com/package/bull#feature-comparison) maintainers._

# Installation

Install via NPM

    npm install aws-agenda

You will also need a working [AWS](https://aws.amazon.com/) account with access to a dynamodb database.


# Example Usage

```js
const awsConfig = {
  profile: awsProfile, // AWS profile object
  region: awsRegion, // AWS region
  scheduleTable: awsDynamoDbScheduleMeta // DynamoDB table where the jobs will be stored
}

const agenda = new Agenda(awsConfig);

await agenda.start()

// Define a job
await agenda.define('UniqueJobName', { concurrency: 1 }, job => {
    // Do things
})


// Schedule a job
await agenda.schedule(date, `UniqueJobName`, {jobData})
```

## Agenda Events

An instance of an agenda will emit the following events:

- `ready` - called when Agenda DynnamoDB connection is successfully opened and indices created.
        If you're passing agenda an existing connection, you shouldn't need to listen for this, as `agenda.start()` will not resolve until indices have been created.
        If you're using the `db` options, or call `database`, then you may still need to listen for the `ready` event before saving jobs. `agenda.start()` will still wait for the connection to be opened.
- `error` - called when Agenda DynnamoDB connection process has thrown an error

```js
await agenda.start();
```

# Acknowledgements
- Agenda was originally created by [@rschmukler](https://github.com/rschmukler).
- [Agendash](https://github.com/agenda/agendash) was originally created by [@joeframbach](https://github.com/joeframbach).
- These days Agenda has a great community of [contributors](https://github.com/agenda/agenda/graphs/contributors) around it. [Join us!](https://github.com/agenda/agenda/wiki)
- This simplified port of agenda to aws is created by [@gariasf](https://github.com/gariasf)

# License
[The MIT License](LICENSE.md)
