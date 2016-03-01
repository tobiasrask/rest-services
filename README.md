# rest-services
[rest-services](https://www.npmjs.org/package/rest-services) provides easy to use RESTful API for [express](https://www.npmjs.com/package/express).

Build your [RESTful API](https://en.wikipedia.org/wiki/Representational_state_transfer) by defining one or more Services with list of Resources.


### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save rest-services

### What does it look like?

Let's build our first *Hello, world!* **Service**. Here is normal usage with ES2015 modules and express:

```js
// server.js
import {RestServices} from 'rest-services'
import ExampleResource from './example-resource'
import express from 'express'

var app = express();

// We define our example service with one resource "ExampleResource"
const config = {
  services: [
    {
      serviceName: "example",
      serviceLabel: "Example API",
      servicePath: "api",
      resources: [
        ExampleResource
      ]
    }
  ]
}

var services = new RestServices(config);
services.mount(app);

var server = app.listen(3000, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.info(`==> 🌎  Listening ${host} on port ${port}.`);
});

```
Following code provides our first **Resource**:

```js
// example-resource.js
import {Resource} from 'rest-services'

// Define your own resources by extending Resource class
class ExampleResource extends Resource {
  
  /**
  * Define resource endpoints.
  *
  * @return state
  */
  getInitialState() {
    return {
      resource_id: 'example',
      resource_definition: {
        operations: {
          retrieve: {
            title: 'Retrieve entity',
            description: 'Retrieve entity by id.',
            callback: this.retrieveItem.bind(this),
            arguments: [
              {
                name: 'id',
                source: {path: 0},
                optional: false,
                type: 'string',
                description: 'Entity id'
              }
            ]
          }        
        },
        actions: {},
        targeted_actions: {}
      }
    };
  }

  /**
  * Retrieve entity data.
  *
  * @param args value with following keys:
  *   _req  Request object provided by express
  *   _res  Response object provided by express js
  *   ... arguments defined by you, see getInitialState()
  * @param callback
  */
  retrieveItem(args, callback) {
    callback(null, {
      result: {
        "msg": "Hello, world!",
        "requestedEntityId": args.id
      }
    });
  }
}

export default ExampleResource;
```

Now start your server and open your browser with url: http://127.0.0.1:3000/api/example/test.
You will see JSON response from server:

```js
{
  msg: "Hello, world!",
  requestedEntityId: "test"
}
```

Documentation
-------------
Our example above was one simple use case. Now let's talk about how it really works.

### Services
Frst we define **Service** for our app. In our example we defined **Example API Service**, which is listening url **/api**.
You can have multiple services if you like, they all have unique paths.

At the moment all reponses are returned with pure JSON. If you need to alter services response data or format, just extend **RestServices** class and implement *sendResponse(err, req, res, response)* method. We will cover this documentation in near future.

### Resources
We need to define the **Resource(s)** to be used with our **Service**. In our example we defined **ExampleResource** with id **example**.
This means that all requests to **/api/example** will be mapped to our example resource.

You can define three different types of resource mappings:
1) operations
2) actions and
3) targeted actions.

#### Operations
Supported [CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) +index operations and corresponding HTTP methods are:
- Create (POST)
- Retrieve (GET)
- Update (PUT)
- Delete (DELETE)
- Index (GET)

In our example these would be:

- Create item: POST /api/example
- Retrieve item: GET /api/example/[id]
- Update item: PUT /api/example/[id]
- Delete item: DELETE /api/example/[id]
- Index items: GET /api/example

#### Actions and targeted actions
Each endpoint can have unlimited number of actions and targeted actions. Both actions are executed by HTTP POST request. The key difference between these two action types is that *actions* are general, whereas *targeted actions* are *targeted* for certain *entity id*.
- Action (POST)
- Targeted action (POST)

In our example these would be:
- Action: POST /api/example/subscribe
- Targeted action: POST /api/example/[id]/subscribe

#### Resource parameters
Resource mappings may define list of parameters they are expecting. Parameters are then processed and provided for your callback automatically.

In our example we defined one parameter named *id* to be retrieved from url path. Parameters can be fetched from *url*, *query string* or request *payload*.

```js
  // Examples how to define arguments with different sources: 
  let arguments = [
    {
      name: 'id',
      source: {path: 0},
      optional: false,
      type: 'string',
      description: 'Entity id from url path, index 0'
    },
    {
      name: 'limit',
      source: {param: 'limit'},
      optional: true,
      type: 'string',
      description: 'Limit will be fetched from query string'
    },
    {
      name: 'item',
      source: 'data',
      optional: false,
      type: 'array',
      description: 'Entity data from request payload'
    }
  ]
```

#### HTTP Access Control (CORS)
If your endpoint will be called from other domain than servers own domain, you need to enable CORS support for [preflight requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS). You can provide default CORS settings for the **Service** or for a single **Resource**. 

Enable CORS by defining key **allowedOrigins** with list of allowed origins. Following example demonstrates how to allow CORS request from certain domain:

```js
// server.js

// Enable CORS support for service level
const config = {
  services: [
    {
      serviceName: "example",
      serviceLabel: "Example API",
      servicePath: "api",
      settings: {
        cors: {
          allowedOrigins: [
            "https://www.npmjs.com/package/rest-services"
          ],
          responseHeaders: [
            {
              key: "Access-Control-Allow-Methods",
              value: "POST, GET, OPTIONS, PUT, DELETE"
            },
            {
              key: "Access-Control-Allow-Headers",
              value: "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With"
            },
            {
              key: "Access-Control-Max-Age",
              value: "1728000"
            },
            {
              key: "Access-Control-Allow-Credentials",
              value: "true"
            }
          ]
        }
      },
      resources: [
        ...
      ]
    }
  ]
}
var services = new RestServices(config);
```
Note that in previous example we also provided a list of CORS response headers to allow better caching.

If you are sure that there is no any security issues with your endpoints, you can allow CORS requests from any domain by giving argument **dangerouslyAllowAll: true**.

```js
// server.js

// Enable CORS for all domains
const config = {
  services: [
    {
      serviceName: "example",
      serviceLabel: "Example API",
      servicePath: "api",
      settings: {
        cors: {
          dangerouslyAllowAll: true
        }
      },
      resources: [
        ...
      ]
    }
  ]
}
```

If there is no reason to allow preflight requests for all resource, you can limit support for only the certain endpoint:
```js
// example-resource.js
import {Resource} from 'rest-services'

class ExampleResource extends Resource {
  
  getInitialState() {
    return {
      resource_id: 'example',
      cors: {
        allowedOrigins: [
          "https://www.npmjs.com/package/rest-services"
        ]
      },
      resource_definition: {
        ...
      }
    }
  }
}
```


## Security
Note that your API might need additional protection because of [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting). We will cover this documentation in near future.

Complete example
-------------------
Let's put all pieces in one Resource:

```js
// example-resource.js
import {Resource} from 'rest-services'

// Define your own resources by extending Resource class
class ExampleResource extends Resource {
  
  /**
  * Define resource endpoints by overriding getInitialState() method.
  *
  * @return state
  */
  getInitialState() {
    return {
      resource_id: 'example',
      resource_definition: {
        operations: {
          retrieve: {
            title: 'Retrieve entity',
            description: 'Retrieve entity by id.',
            callback: this.retrieveItem.bind(this),
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
            title: 'Create entity',
            description: 'Create entity.',
            callback: this.createItem.bind(this),
            arguments: [
              {
                name: 'entityData',
                source: 'data',
                optional: false,
                type: 'array',
                description: 'Entity data'
              }
            ]
          },
          update: {
            title: 'Update entity',
            description: 'Update entity.',
            callback: this.updateItem.bind(this),
            arguments: [
              {
                name: 'id',
                source: {path: 0},
                optional: false,
                type: 'string',
                description: 'Entity id'
              },
              {
                name: 'entityData',
                source: 'data',
                optional: false,
                type: 'array',
                description: 'Entity data'
              }
            ]
          },
          delete: {
            title: 'Delete entity',
            description: 'Delete entity.',
            callback: this.deleteItem.bind(this),
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
          index: {
            title: 'Index',
            description: 'Fetch list of entities based on given criteria',
            callback: this.indexList.bind(this),
            arguments: [
              {
                name: 'limit',
                source: {param: 'limit'},
                optional: true,
                type: 'string',
                description: 'Limit'
              }
            ]
          }          
        },
        actions: {
          subscribe: {
            title: "Subscribe",
            description: "Subscribe to get news from new entities",
            callback: this.subscribe.bind(this),
            arguments: [
              {
                name: 'subscription',
                source: 'data',
                optional: false,
                type: 'array',
                description: 'Subscription data'
              }
            ]
          }
        },
        targeted_actions: {
          subscribe: {
            title: "Subscribe to entity modifications",
            description: "Subscribe to get news from this entity modifications",
            callback: this.entitySubscribe.bind(this),
            arguments: [
              {
                name: 'id',
                source: {path: 0},
                optional: false,
                type: 'string',
                description: 'Entity id'
              },          
              {
                name: 'subscription',
                source: 'data',
                optional: false,
                type: 'array',
                description: 'Subscription data'
              }
            ]
          }
        }
      }
    };
  }

  /**
  * Retrieve entity data.
  *
  * @param args value with following keys:
  *   _req  Request object provided by express
  *   _res  Response object provided by express js
  *   ... arguments defined by you, see getInitialState()
  *   
  * @param callback
  */
  retrieveItem(args, callback) {
    // Entity id will be available from args
    let entityId = args.id;

    // Send custom http error codes
    if (isNaN(entityId))
      return callback(this.setError(500, "Invalid entity id."));

    // By default your endpoint will return HTTP status code 200 OK
    callback(null, {
      result: {
        "msg": "Hello, world!",
        "requestedEntityId": entityId
      }
    });
  }

  /**
  * Create entiy.
  *
  * @param args
  * @param callback
  */
  createItem(args, callback) {
    // Request payload data is passed for you 
    let entityParams = args.entityData;

    // Implement this functionality...
    callback(null, {
      result: false
    });
  }

  /**
  * Update entity.
  *
  * @param args
  * @param callback
  */
  updateItem(args, callback) {
    // Implement this functionality...  
    callback(null, {
      result: false
    });
  }

  /**
  * Delete entity.
  *
  * @param args
  * @param callback
  */
  deleteItem(args, callback) {
    // Implement this functionality...
    callback(null, {
      result: false
    });
  }

  /*
  * Index entities.
  *
  * @param args
  * @param callback
  */
  indexList(args, callback) {
    let entityIds = [];
    // Implement this functionality...
    callback(null, {
      result: entityIds
    });
  }

  /*
  * Subscribe action.
  *
  * @param args
  * @param callback
  */
  subscribe(args, callback) {
    let succeed = false;
    // Request payload data is passed for you 
    let entityParams = args.subscription;

    // Implement this functionality...

    callback(null, {
      result: succeed
    });
  }

  /*
  * Entity subscribe, targeted action.
  *
  * @param args
  * @param callback
  */
  entitySubscribe(args, callback) {
    let succeed = false;

    // Entity id will be available from args
    let entityId = args.id;

    // Request payload data is passed for you 
    let entityParams = args.subscription;

    // Implement this functionality...

    callback(null, {
      result: succeed
    });
  }
}
export default ExampleResource;
```

### Test
Run tests using [npm](https://www.npmjs.com/):

    $ npm run test

### Need more infromation?
This module is inspired by Drupal's Services module. Feel free to comment and leave issues.


[npm]: https://www.npmjs.org/package/rest-services