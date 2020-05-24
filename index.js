const _ = require('lodash')
const moment = require('moment')
const path = require('path')

const { createLogger, format, transports } = require('winston');

module.exports = (config) => {
  const prefixFields = _.get(config, 'prefixFields', [])
  const timestampFormat = _.get(config, 'timestampFormat', 'YYYY-MM-DD HH:mm:ss')
  const level = _.get(config, 'level', (process.env.NODE_ENV === 'production' ? 'info' : 'verbose'))
  const headLength = _.get(config, 'headLength', 80)
  const padLength = _.get(config, 'padLength', 12)

  const myFormat = format.printf(({ timestamp, level, message, meta, e }) => {
    const fileName = _.get(meta, 'fileName') ? _.get(meta, 'fileName') + ' | ' : ''
    const functionName = _.get(meta, 'functionName') ? _.get(meta, 'functionName') + ' | ' : ''
    const subName = _.get(meta, 'sub') ? _.get(meta, 'sub') + ' | ' : ''

    let prefix = []
    let data = []
    _.forEach(prefixFields, item => {
      if (_.get(meta, _.get(item, 'field'))) {
        prefix.push(_.get(item, 'short'))
        data.push(_.get(meta, _.get(item, 'field')))
      }  
    })
    const prefixData = _.size(prefix) ? (_.join(prefix, '/') + ' ' + _.join(data, '/') + ' | ') : ''
    if (e instanceof Error) {
      // log the stack
      console.error(e)
    }
    return `${timestamp} ${level} ${fileName}${functionName}${subName}${prefixData}${message}`;
  })

  const acLogger = createLogger({
    level,
    format: format.combine(
      format.timestamp({
        format: timestampFormat
      }),
      format.errors({ stack: true }),
      format(info => {
        info.level = _.padEnd(info.level.toUpperCase(), 8)
        return info;
      })(),
      format.colorize(),
      format.splat(),
      myFormat
    ),
    transports: [
      new transports.Console()
    ]
  })

  if (process.env.NODE_ENV === 'test') {
    acLogger.add(new transports.File({
      filename: 'test.log',
      level: 'debug'
    }))
  }

  const headline = (params) => {
    acLogger.info('')
    const fill = _.get(params, 'headFill', '*')
    acLogger.info('%s', _.pad(' ' + _.toUpper(_.get(params, 'headline')) + ' ', headLength, fill))
  }

  const functionStartLine = (params) => {
    const fill = _.get(params, 'headFill', '_')
    acLogger.info('%s', _.pad(' ' + _.toUpper(_.get(params, 'headline')) + ' ', headLength, fill))
  }

  const listing = (params) => {
    const field = _.upperFirst(_.get(params, 'field'))
    const value = _.get(params, 'value')
//    const padField = _.get(meta, 'padField') ? (_.padEnd((_.get(meta, 'padField.field') + ': '), _.get(meta, 'padField.padLength', padLength)) + (_.get(meta, 'padField.value') === 200 ? '\x1b[32mSuccessful\x1b[0m' : _.get(meta, 'padField.value'))) : ''
    const message = _.padEnd((field + _.get(params, 'separator', '')), _.get(params, 'padLength', padLength)) + (value === 200 ? '\x1b[32mSuccessful\x1b[0m' : value)
    acLogger.info(message)
  }

  const bootstrapInfo = (params) => {
    const pwd = _.get(process, 'env.PWD', process.cwd()) 
    const pjson = require(path.resolve(pwd, 'package.json'))
    const environment = process.env.NODE_ENV || 'development'
    const appName = _.get(params, 'appName', 'App name missing')
    const padLength = 15
    acLogger.info('')
    acLogger.info(_.repeat('-', headLength))
    listing({ field: 'Time', value: moment().format('YYYY-MM-DD HH:mm:ss'), padLength })
    listing({ field: 'Environment', value: environment, padLength })
    listing({ field: 'Version', value: pjson.version, padLength })
    listing({ field: 'AppName', value: appName, padLength })
    acLogger.info('')
    listing({ field: 'BOOTSTRAPPING', value:  '\x1b[32mSuccessful\x1b[0m', padLength })   
    acLogger.info(_.repeat('-', headLength))
    acLogger.info('')
  }

  /**
   * Logs typical infos (bootstrap) for servers
   * Instance, host, port, db, 
   * and connection
   */
  const serverInfo = (params) => {
    const fields = ['instance', 'server', 'host', 'port', 'version', 'cluster', 'clusterVersion', 'ssl', 'db', 'database', 'index', 'user']
    _.forEach(fields, field => {
      if (_.get(params, field)) {
        listing({ field: _.upperFirst(field), value: _.get(params, field) })
      }
    })
    listing({ field: 'Connection', value: '\x1b[32mSuccessful\x1b[0m' })
  }

  
  const acSESnfo = (params) => {
    const fields = [
      { field: 'aws.accessKeyId', name: 'AWS AcccesKey' },
      { field: 'defaultSender.address', name: 'Default Sender' },
      { field: 'supportRecipient.address', name: 'Support' },
    ]
    _.forEach(fields, field => {
      if (_.get(params, field.field)) {
        listing({ field: field.name, value: _.get(params, field.field), padLength: 15 })
      }
    })
  }

  return {
    acLogger,
    headline,
    functionStartLine,
    listing,
    bootstrapInfo,
    serverInfo,
    acSESnfo
  }
}