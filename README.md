# AC Logger
Unified logging function for all backend applications of AdmiralCloud. Use it instead of Winston (it is based on Winston)

The purpose of the little app is to make sure that all applications use the same log format/notations.

## Usage
Use it like Winston!

```
const aclog = require('ac-logger')

const logConfig = {
  prefixFields: [
    { field: 'jobId', short: 'J' },
  ]
}

app = {} // 
app.log = aclog({ prefixFields: logConfig.prefixFields }).acLogger

let logMeta = {
  fileName: 'UploadS3',
  functionName: 'upload',
  jobId: 123 // prefixField
}
app.log.info('Message for %s', 'some string', { meta: logMeta })
// -> INFO UploadS3 | upload | J 193 | Message for some string

```

## Error logging
If you want to add the stack (from an error instance) to an error log use it like this:
```
try {
  let data = Buffer.from()
}
catch(e) {
  app.log.error('We have encountered an error in module %s', 'Module name', { e })
}
```

This will result in a nice log entry and above that a console.error message with the stack from e.

If you want to log a custom error message, not an error instance, you can use it like this:
```
let errorMessage = {
  message: 'user_emailWrong',
  code: 1234
}
app.log.error('We have encountered an error in module %s - %j', 'Module name', errorMessage)

// -> We have encountered an error in module Module name - { message: 'user_emailWrong', code: 1234 }
```


#Helper functions
To improve the logging even more, there are several helper functions available

### Headline
Used in bootstrapping to seperate sections
```
aclog().headline({ headline: 'AWS' })
// -> ****** AWS ********
``` 

### functionStartLine
Used in to log the beginning of a function
```
aclog().functionStartLine({ headline: 'my function' })
// -> ______ My function ______
``` 

### listing
Used in bootstrap
```
aclog().listing({ field: 'servername', value: 'localhost' })
// -> Servername:        localhost
``` 

TBC

## Links
- [Website](https://www.admiralcloud.com/)
- [Twitter (@admiralcloud)](https://twitter.com/admiralcloud)
- [Facebook](https://www.facebook.com/MediaAssetManagement/)

## License
[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud, Mark Poepping