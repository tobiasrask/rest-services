# rest-services
[rest-services](https://www.npmjs.org/package/rest-services): provides easy to use RESTful API for [express](https://www.npmjs.com/package/express).

Build your RESTful API by defining one or more Services with list of Resources.


### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save rest-services

### How to use with express

Normal usage with ES2015 modules:

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

Now let's define our example resource:

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

Now start your server and open your browser with url: http://127.0.0.1:3000/api/example/test.
You will see json response from server:

```js
{
  msg: "Hello, world!",
  requestedEntityId: "test"
}
```

### Documentation

Our example above was one simple use case. Now let's talk about how it really works.

#### Services
At first we define **Service** for our app. In our example we defined **Example API Service**, which is listening url **/api**.
You can have multiple services if you like, they all have unique paths.

At the moment all reponses are returned with pure JSON.

If you need to alter services response data or format, just extend **RestServices** class and implement *sendResponse(err, req, res, response)* method. We will cover this documentation in near future.


#### Resources
We need to define the **Resource(s)** to be used with our **Service**. In our example we defined **ExampleResource** with id **example**.
This means that all requests to **/api/example** will be mapped to our example resource.

You can define three different types of resource mappings:
1) operations
2) actions and
3) targeted actions.

Operations
----------
Supported CRUD+index operations and corresponding HTTP methods are:
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

Actions and targeted actions
----------------------------
Each endpoint can have unlimited number of actions and targeted actions. Both actions are executed by HTTP POST request. The difference between these two action types is that actions are general, targeted actions are *targeted* for certain *entity id*.
- Action (POST)
- Targeted action (POST)

In our example these would be:
- Action: POST /api/example/subscribe
- Targeted action: POST /api/example/[id]/subscribe

Resource parameters
-------------------
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

### Security
Note that your API might need additional protection because of [XSS](https://en.wikipedia.org/wiki/Cross-site_scripting). We will cover this documentation in near future.

### Test
Run tests by npm:

```js
npm run test
```

### Need more infromation?
This module is inspired by Drupal's Services module. Feel free to comment and leave issues.


[npm]: https://www.npmjs.org/package/rest-services