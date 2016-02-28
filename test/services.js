import {RestServices, Resource} from "./../src/index"
import assert from "assert";

describe('RestServices', () => {

  describe('Test initialization', () => {
    it('It should initialize services without errors', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:';
      let serviceLabelProb = 'Test API';
      let servicePathProb = 'api:';
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
          };
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

      var restServices = new RestServices(config);
      let service = restServices.getServiceByName(serviceNameProb)

      if (!service)
        return done(new Error("It didn't return service"));

      if (service.getServiceName() != serviceNameProb)
        return done(new Error("Service name was not initialized appropriate"));

      if (service.getServicePath() != servicePathProb)
        return done(new Error("Service path was not initialized appropriate"));

      let resourceInstance = service.getResource(resourceIdProb);
      if (!resourceInstance)
        return done(new Error("It didn't return resource by id"));

      if (resourceInstance.getResourceID() != resourceIdProb)
        return done(new Error("Resource id doesn't match"));

      done();
    })
  });

  describe('Test service selectors', () => {
    it('It should select correct selectors for lookup', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:';
      let serviceLabelProb = 'Test API';
      let servicePathProb = 'api';
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
            operation: 'destroy'
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
      ];

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
          };
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

      var restServices = new RestServices(config);
      let service = restServices.getServiceByName(serviceNameProb)
      let errors = [];

      selectorTests.map(item => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }
        let urlInfo = service.getUrlInfo(req);
        let selector = service.buildSelector(urlInfo);
        if (JSON.stringify(selector) != item.assumeSelector)
          errors.push(new Error(`Wrong selector returned for: ${item.method}`));
      });

      if (errors.length > 0)
        done(errors);
      else 
        done();
    })
  });

  describe('Test service lookup', () => {
    it('It should return 404 error if resource doesn\'t exists.', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:';
      let serviceLabelProb = 'Test API';
      let servicePathProb = 'api';
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
            operation: 'destroy'
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
      ];

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
          };
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

      var restServices = new RestServices(config);
      let service = restServices.getServiceByName(serviceNameProb)

      let errors = [];

      // Test for selector selection
      selectorTests.map(item => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }

        service.lookup(req, {}, (err, data) => {
          if (!err)
            errors.push(new Error(`It should return error for ${item.url}`));
        });
      });

      if (errors.length > 0)
        done();
      else 
        done();
    })
  });

  describe('Test service lookup', () => {
    it('It should pass execution if operation exists.', (done) => {

      // Define probs
      let serviceNameProb = 'testResource:';
      let serviceLabelProb = 'Test API';
      let servicePathProb = 'api';
      let resourceIdProb = 'resource'

      // Endpoint result tests
      const resultTests = {
        retrieve: 'retrieveProb:',
        create: 'createProb:',
        update: 'updateProb:',
        index: 'indexProb:',
        delete: 'destroyProb:',
        action: 'actionProb:',
        targettedAction: 'targettedActionProb:'
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
          assumeResult: resultTests.targettedAction
        },
      ];

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
                    });
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
                    });
                  },
                  arguments: []
                },
                update: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.update
                    });
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
                destroy: {
                  title: '',
                  description: '',
                  callback: (args, callback) => {
                    callback(null, {
                      result: resultTests.destroy
                    });
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
                    });
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
                    });
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
                      result: resultTests.targettedAction
                    });
                  },
                  arguments: []
                }                 
              }
            }
          };
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

      var restServices = new RestServices(config);
      let service = restServices.getServiceByName(serviceNameProb)
      let errors = [];

      // Test for selector selection
      selectorTests.map(item => {
        let req = {
          method: item.method,
          originalUrl: item.url
        }

        service.lookup(req, {}, (err, output) => {
          if (err)
            return errors.push(new Error(`It returned error for ${item.url}`));

          if (output.result !== item.assumeResult)
            errors.push(new Error(`Unexpected result for ${item.url}`));
        });
      });

      if (errors.length > 0)
        done(errors[0]);
      else 
        done();
    })
  });
});