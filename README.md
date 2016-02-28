# rest-services
[rest-services](https://www.npmjs.org/package/rest-services): provides easy to use RESTful API for [express](https://www.npmjs.com/package/express)

Build your RESTful API by defining one or more Services with list of Resources.


### Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save rest-services

### How to use with express

Normal usage with ES2015 modules:

```js
// server.js
import {RestServices} from 'rest-services'
import ExampleResource from './example-resource';

var express = require('express');
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

Now let's defined our example resource:

```js
// example-resource.js
import {Resource} from 'rest-services'

// Define your own resources by extending Resource class
class ExampleResource extends Resource {
  
  /**
  * Define resource endpoints by overriding getInitialState() method.
  *
  * @return state
  *
  getInitialState() {
    return {
      props: {
        resource_id: 'example'
      },
      resource_definition: {
        operations: {
          retrieve: {
            title: '',
            description: '',
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
        },
        actions: {},
        targeted_actions: {}
      }
    };
  }

  /**
  * Retrieve item data.
  *
  * @param args value with following keys:
  *   _req  Request object provided by express
  *   _res  Response object provided by express js
  *   ... arguments defined by you, see getInitialState()
  *   
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

```

Now start your server and open url: http://127.0.0.1:3000/api/example/test
It will show you json response

```js
{
  msg: "Hello, world!",
  requestedEntityId: "test"
}
```

### Documentation

Our example was one simple use case. Now let's talk about how it really works.

#### Services
First of all you define *Service* for your app. In our example we defined **Example API Service**, which is listening url **/api**.
You can have multiple services if you like, they all have unique path.

If you need to alter response data, just extend **RestServices** class and implement *sendResponse(err, req, res, response)* method. We will cover this documentation in near future.


#### Resources
You need to define *Resources* to be used with your *Service*. We defined **ExampleResource** with id **example**.
This means that all requests to **/api/example** will be mapped for your resource.

You can define three different types of resource mappings:
1) operations
2) actions and
3) targeted actions

Operations
----------
Supported CRUD+index operations and corresponding http methods are:
- create (POST)
- retrieve (GET)
- update (PUT)
- delete (DELETE)
- index (GET)

In our example these would be:

Create item: POST /api/example
Retrieve item: GET /api/example/[id]
Update item: PUT /api/example/[id]
Delete item: DELETE /api/example/[id]
Index items: GET /api/example

Actions and targeted actions
----------------------------
Each endpoint can have unlimited number of actions and targeted actions. The difference between these two action classes that actions are general, targeted actions are targeted for certain entity id.

In our example these would be:
Action: POST /api/example/[action]
Targeted action: POST /api/example/[id]/[action]

Resource parameters
-------------------
Resource mappings may define list of parameters they are expecting. Parameters are then processed and provided for your callback automatically.

In our example we defined one parameter named *id* to be retrieved from url path. Parameters can be fetched from *url*, *query string* and *payload*.

```js
  // Examples how to define arguments with different sources:
  let arguments = [
    {
      name: 'id',
      source: {path: 0},
      optional: false,
      type: 'string',
      description: 'Entity id from url path'
    },
    {
      name: 'limit',
      source: {param: 'limit'},
      optional: true,
      type: 'string',
      description: 'Limit from query string'
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

### Need more infromation?
This module is inspired by Drupals Services module. Feel free to comment and leave issues.


[npm]: https://www.npmjs.org/package/rest-services