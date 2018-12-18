import {RestServices, Resource} from './../src/index'

describe('RestServicesOldAPI', () => {

  describe('Test initialization', () => {
    it('It should initialize services without errors', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api:'
      let resourceIdProb = 'resourceId:'

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            props: {
              resource_id: resourceIdProb
            },
            resource_definition: {
              operations: {},
              actions: {},
              targeted_actions: {}
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      const restServices = new RestServices(config)
      const service = restServices.getServiceByName(serviceNameProb)

      if (!service) {
        return done(new Error('It didn\'t return service'))
      }

      if (service.getServiceName() != serviceNameProb) {
        return done(new Error('Service name was not initialized appropriate'))
      }

      if (service.getServicePath() != servicePathProb) {
        return done(new Error('Service path was not initialized appropriate'))
      }

      const resourceInstance = service.getResource(resourceIdProb)
      if (!resourceInstance) {
        return done(new Error('It didn\'t return resource by id'))
      }

      if (resourceInstance.getResourceID() != resourceIdProb) {
        return done(new Error('Resource id doesn\'t match'))
      }

      done()
    })
  })

  describe('Test initialization with v0.1.2', () => {
    it('It should initialize services without errors', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api:'
      let resourceIdProb = 'resourceId:'

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            resource_id: resourceIdProb,
            resource_definition: {
              operations: {},
              actions: {},
              targeted_actions: {}
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      var restServices = new RestServices(config)
      let service = restServices.getServiceByName(serviceNameProb)

      if (!service) {
        return done(new Error('It didn\'t return service'))
      }

      if (service.getServiceName() != serviceNameProb) {
        return done(new Error('Service name was not initialized appropriate'))
      }

      if (service.getServicePath() != servicePathProb) {
        return done(new Error('Service path was not initialized appropriate'))
      }

      const resourceInstance = service.getResource(resourceIdProb)

      if (!resourceInstance) {
        return done(new Error('It didn\'t return resource by id'))
      }

      if (resourceInstance.getResourceID() != resourceIdProb) {
        return done(new Error('Resource id doesn\'t match'))
      }

      done()
    })
  })

  describe('Test service selectors', () => {
    it('It should select correct selectors for lookup', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api'
      let resourceIdProb = 'resource'

      const selectorTests = [
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'index'
          })
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'create'
          })
        },
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'retrieve'
          })
        },
        {
          method: 'PUT',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'update'
          })
        },
        {
          method: 'DELETE',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'delete'
          })
        },        
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/actionName`,
          assumeSelector: JSON.stringify({
            type: 'actions',
            operation: 'actionName'
          })
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/1/targetActionName`,
          assumeSelector: JSON.stringify({
            type: 'targetedActions',
            operation: 'targetActionName'
          })
        },
      ]

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            props: {
              resource_id: resourceIdProb
            },
            resource_definition: {
              operations: {},
              actions: {},
              targeted_actions: {}
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      var restServices = new RestServices(config)
      let service = restServices.getServiceByName(serviceNameProb)
      let errors = []

      selectorTests.map((item) => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }
        let urlInfo = service.getUrlInfo(req)
        let selector = service.buildSelector(urlInfo)
        if (JSON.stringify(selector) != item.assumeSelector) {
          errors.push(new Error(`Wrong selector returned for: ${item.method}`))
        }
      })

      if (errors.length > 0) {
        done(errors)
      } else {
        done()
      } 
    })
  })

  describe('Test service lookup', () => {
    it('It should return 404 error if resource doesn\'t exists.', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api'
      let resourceIdProb = 'resource'

      const selectorTests = [
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'index'
          })
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'create'
          })
        },
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'retrieve'
          })
        },
        {
          method: 'PUT',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'update'
          })
        },
        {
          method: 'DELETE',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'delete'
          })
        },        
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/actionName`,
          assumeSelector: JSON.stringify({
            type: 'actions',
            operation: 'actionName'
          })
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/1/targetActionName`,
          assumeSelector: JSON.stringify({
            type: 'targeted_actions',
            operation: 'targetActionName'
          })
        },
      ]

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            props: {
              resource_id: resourceIdProb
            },
            resource_definition: {
              operations: {},
              actions: {},
              targeted_actions: {}
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      var restServices = new RestServices(config)
      let service = restServices.getServiceByName(serviceNameProb)

      let errors = []

      // Test for selector selection
      selectorTests.map((item) => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }

        service.lookup(req, {}, (err, _data) => {
          if (!err) {
            errors.push(new Error(`It should return error for ${item.url}`))
          }
        })
      })

      if (errors.length > 0) {
        done()
      } else {
        done()
      } 
    })
  })

  describe('Test service lookup', () => {
    it('It should pass execution if operation exists.', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api'
      let resourceIdProb = 'resource'

      // Endpoint result tests
      const resultTests = {
        retrieve: 'retrieveProb:',
        create: 'createProb:',
        update: 'updateProb:',
        index: 'indexProb:',
        delete: 'deleteProb:',
        action: 'actionProb:',
        targetedAction: 'targetedActionProb:'
      }

      const selectorTests = [
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'index'
          }),
          assumeResult: resultTests.index
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'create'
          }),
          assumeResult: resultTests.create
        },
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'retrieve'
          }),
          assumeResult: resultTests.retrieve
        },
        {
          method: 'PUT',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'update'
          }),
          assumeResult: resultTests.update
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/someAction`,
          assumeSelector: JSON.stringify({
            type: 'actions',
            operation: 'actionName'
          }),
          assumeResult: resultTests.action
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/1/someTargettedAction`,
          assumeSelector: JSON.stringify({
            type: 'targeted_actions',
            operation: 'targetActionName'
          }),
          assumeResult: resultTests.targetedAction
        },
      ]

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            props: {
              resource_id: resourceIdProb
            },
            resource_definition: {
              operations: {
                retrieve: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.retrieve
                    })
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entity id'
                    }
                  ]
                },
                create: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.create
                    })
                  },
                  arguments: []
                },
                update: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.update
                    })
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entity id'
                    }
                  ]
                },
                delete: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.delete
                    })
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entiy id'
                    }
                  ]
                },
                index: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.index
                    })
                  },
                  arguments: []
                }
              },
              actions: {
                someAction: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.action
                    })
                  },
                  arguments: []
                }          
              },
              targeted_actions: {
                someTargettedAction: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.targetedAction
                    })
                  },
                  arguments: []
                }                 
              }
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      var restServices = new RestServices(config)
      let service = restServices.getServiceByName(serviceNameProb)
      let errors = []

      // Test for selector selection
      selectorTests.map((item) => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }

        service.lookup(req, {}, (err, output) => {
          if (err) {
            return errors.push(new Error(`It returned error for ${item.url}`))
          }

          if (output.result !== item.assumeResult) {
            errors.push(new Error(`Unexpected result for ${item.url}`))
          }
        })
      })

      if (errors.length > 0) {
        done(errors[0])
      } else {
        done()
      } 
    })
  })

  describe('Error responses and HTTP status codes', () => {
    it('It should pass error data.', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:'
      let serviceLabelProb = 'Test API'
      let servicePathProb = 'api'
      let resourceIdProb = 'resource'

      // Endpoint result tests
      const resultTests = {
        retrieve: {msg: 'retrieveProb:', code: 100},
        create: {msg: 'createProb:', code: 200},
        update: {msg: 'updateProb:', code: 301},
        index: {msg: 'indexProb:', code: 400},
        delete: {msg: 'deleteProb:', code: 404},
        action: {msg: 'actionProb:', code: 500},
        targetedAction: {msg: 'targetedActionProb:', code: 501}
      }

      const selectorTests = [
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'index'
          }),
          assumeResult: resultTests.index
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'create'
          }),
          assumeResult: resultTests.create
        },
        {
          method: 'GET',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'retrieve'
          }),
          assumeResult: resultTests.retrieve
        },
        {
          method: 'PUT',
          url: `/${servicePathProb}/${resourceIdProb}/1`,
          assumeSelector: JSON.stringify({
            type: 'operations',
            operation: 'update'
          }),
          assumeResult: resultTests.update
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/someAction`,
          assumeSelector: JSON.stringify({
            type: 'actions',
            operation: 'actionName'
          }),
          assumeResult: resultTests.action
        },
        {
          method: 'POST',
          url: `/${servicePathProb}/${resourceIdProb}/1/someTargettedAction`,
          assumeSelector: JSON.stringify({
            type: 'targeted_actions',
            operation: 'targetActionName'
          }),
          assumeResult: resultTests.targetedAction
        },
      ]

      // Test resource stub
      class TestResource extends Resource {
        getInitialState() {
          return {
            props: {
              resource_id: resourceIdProb
            },
            resource_definition: {
              operations: {
                retrieve: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.retrieve
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entity id'
                    }
                  ]
                },
                create: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.create
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: []
                },
                update: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.update
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entity id'
                    }
                  ]
                },
                delete: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.delete
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: [
                    {
                      name: 'id',
                      source: {path: 0},
                      optional: false,
                      type: 'string',
                      description: 'Entiy id'
                    }
                  ]
                },
                index: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.index
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: []
                }
              },
              actions: {
                someAction: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.action
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: []
                }          
              },
              targeted_actions: {
                someTargettedAction: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    let item = resultTests.targetedAction
                    callback(this.setError(item.code, item.msg))
                  },
                  arguments: []
                }                 
              }
            }
          }
        }
      }

      const config = {
        services: [
          {
            serviceName: serviceNameProb,
            serviceLabel: serviceLabelProb,
            servicePath: servicePathProb,
            resources: [
              TestResource
            ]
          }
        ]
      }

      var restServices = new RestServices(config)
      let service = restServices.getServiceByName(serviceNameProb)
      let errors = []

      // Test for selector selection
      selectorTests.map((item) => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }

        service.lookup(req, {}, (err, _output) => {
          if (!err) {
            return errors.push(new Error(`It should return error ${item.url}`))
          }
          
          // Validate error code
          if (err.code !== item.assumeResult.code) {
            errors.push(new Error(`Unexpected error code ${item.url}`))
          }

          if (err.toString() !== 'Error: ' + item.assumeResult.msg) {
            errors.push(new Error(`Unexpected error message ${item.url}`))
          }
        })
      })

      if (errors.length > 0) {
        done(errors[0])
      } else {
        done()
      } 
    })
  })
})
