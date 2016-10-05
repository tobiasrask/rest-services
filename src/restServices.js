import DomainMap from "domain-map"
import ServiceHandler from "./serviceHandler";

class RestServices {

  /**
  * Construct services.
  *
  * TODO: Provide methods to register new resources on the fly...
  *
  * @param configuration
  */
  constructor(configuration = {}) {
    this._registry = new DomainMap();

    let debug = configuration.hasOwnProperty('debug') ?
      configuration.debug : false;

    this._registry.set('properties', 'debug', debug);

    this.loadServices(configuration);
  }

  /**
  * Load services
  *
  * @param configuration
  *   services
  *     List of services with service configuration.
  */
  loadServices(configuration) {
    let services = configuration.hasOwnProperty('services') ?
      configuration.services : [];

    services.map(serviceConfig => {
      // Allow custom handlers
      let handler = serviceConfig.hasOwnProperty('handler') ?
        new serviceConfig.handler(serviceConfig, this) :
        new ServiceHandler(serviceConfig, this)

      this._registry.set('services', serviceConfig.serviceName, handler);
      this.log(`Service '${serviceConfig.serviceName}' registered`);
    });
  }

  /**
  * Returns list of intalled services.
  *
  * @return map
  */
  getServices() {
    return this._registry.getDomain('services', new Map());
  }

  /**
  * Returns installed service by key id.
  *
  * @param service name
  * @return map
  */
  getServiceByName(serviceName) {
    return this._registry.get('services', serviceName);
  }

  /**
  * Mount services to express application.
  *
  * @param app
  *   Express application where services are mounted
  */
  mount(app) {
    var self = this;

    // For each service handlers
    self.getServices().forEach((serviceHandler, serviceName) => {
      self.log(`Mounting service: ${serviceName}`);

      // Mount each resource id
      serviceHandler.getResourceIdentifiers().map((resource_key) => {
        let path = `/${serviceHandler.getServicePath()}/${resource_key}`;
        self.log(`Registering path ${path}`);

        app.use(path, function(req, res, next) {
          // Route request to resource and fetch response
          serviceHandler.lookup(req, res, function(err, response = {}) {
            // Allow altering response sending
            self.sendResponse(err, req, res, response);
          });
        });
      });
    });
  }

  /**
  * Method returns query response. This allows one to alter response before
  * sending. Response format defaults to json.
  *
  * @param err
  * @param req
  * @param res
  * @param response
  */
  sendResponse(err, req, res, response) {
    var responseFormat = 'json';
    let contentType = req.get('Content-Type');

    switch (contentType) {
      case "json":
      case "application/json":
        responseFormat = "json";
        break;

      case "javascript":
      case "application/javascript":
        responseFormat = "jsonp";
        break;

      case "text/plain":
      case "text/html":
        responseFormat = "text";
        break;
    }

    if (err) {
      var hsc = err.hasOwnProperty('code') ? err.code : 500;

      if (responseFormat == "jsonp") {
        res.status(hsc).jsonp({
          error: {
            code: hsc,
            message: err.message
          }
        });
      } else if (responseFormat == "json") {
        res.status(hsc).json({
          error: {
            code: hsc,
            message: err.message
          }
        });
      } else {
        // Unknown response format
        res.status(hsc).send(err.message);
      }

    } else if (response.hasOwnProperty('result') && response.result != null) {
      // Send result
      if (responseFormat == "jsonp") {
        res.jsonp(response.result);
      } else if (responseFormat == "json") {
        res.json(response.result);
      } else {
        // Unknown response format
        res.sendStatus(400);
      }
    } else {
      // No content, send status
      res.sendStatus(200);
    }
    res.end();
  }

  /**
  * Log debugging data.
  *
  * @param value
  */
  log(value) {
    if (this._registry.get('properties', 'debug', false))
      console.log(value);
  }
}

export default RestServices;