import DomainMap from "domain-map"

/**
* Resource class
*/
class Resource {

  /**
  * Construct resource object.
  *
  * @param variables
  */
  constructor(variables = {}) {
    this._registry = new DomainMap();

    if (variables.hasOwnProperty('context'))
      this._registry.set('properties', 'context', variables.context);

    if (variables.hasOwnProperty('serviceSettings'))
      this._registry.set('properties', 'serviceSettings', variables.serviceSettings);

    let state = this.getInitialState();

    // Support old notation
    if (state.hasOwnProperty('props') &&
        state.props.hasOwnProperty('resource_id')) {
      state.resourceId = state.props.resource_id;
    }
    if (state.hasOwnProperty('resource_id')) {
      state.resourceId = state.resource_id;
    }
    if (state.hasOwnProperty('resource_definition')) {
      state.resourceDefinition = state.resource_definition;
      delete state.resource_definition;
    }
    if (state.hasOwnProperty('resourceDefinition') &&
        state.resourceDefinition.hasOwnProperty('targeted_actions') ) {
      state.resourceDefinition.targetedActions = state.resourceDefinition.targeted_actions;
      delete state.resourceDefinition.targeted_actions;
    }

    this._registry.set('properties', 'state', state);
  }

  /**
  * Returns initial state.
  *
  * @return data
  */
  getInitialState() {
    return {
      resourceId: false,
      resourceDefinition: {
        operations: {},
        actions: {},
        targetedActions: {}
      }
    };
  }

  /**
  * Returns resource context.
  *
  * @return context
  *   Expected valeus are "server" or "manual". Lambda and test cases uses
  *   "manual", expressjs uses "server".
  */
  getContext() {
    return this._registry.get('properties', 'context', false);
  }

  /**
  * Resource enabled
  *
  * @param selector
  *   type
  *   method
  */
  resourceEnabled(selector) {
    // TODO
    return true;
  }

  /**
  * Method returns resource info for requested operation.
  *
  * @param selectorwith keys type & method
  * - type
  *   Resource type can be 'operations' or 'actions'
  * - operation
  *   can be operation name like 'create', 'update' or action name like 'updateAll';
  * @return boolean is enabled
  */
  getEndpointInfo(selector) {
    const {type, operation} = selector;

    let resourceDefinition = this.resourceDefinition();

    return (resourceDefinition.hasOwnProperty(type) &&
            resourceDefinition[type].hasOwnProperty(operation)) ?
                resourceDefinition[type][operation] : false;
  }

  /**
  * Returns resource identifier.
  *
  * @return id
  */
  getResourceID() {
    let state = this._registry.get('properties', 'state');

    if (state.hasOwnProperty('resourceId'))
      return state.resourceId;

    throw "Resource id is not defined";
  }

  /**
  * Returns cors options
  *
  * @return cors
  */
  getResourceCORS() {
    // Local settings
    let state = this._registry.get('properties', 'state');
    if (state.hasOwnProperty('cors'))
      return state.cors;

    // Global settings
    state = this._registry.get('properties', 'serviceSettings');
    if (state.hasOwnProperty('cors'))
      return state.cors;

    return false;
  }


  /**
  * Resource definition contains information about service methods
  * and related operations.
  *
  * @return data
  */
  resourceDefinition() {
    let state = this._registry.get('properties', 'state');
    return state.resourceDefinition;
  }

  /**
  * Check if http-cache control is enabled for current selector.
  *
  * @param selector
  * @return boolean enabled
  */
  cacheControlEnabled(selector) {
    return false;
  }

  /**
  * Handle CORS request.
  *
  * @param args
  * @param callback
  */
  accessControlCORS(req, res, callback) {
    let corsOptions = this.getResourceCORS();

    // If CORS is not defined, we skip this
    if (!corsOptions)
      return callback(null);

    let corsAllowAll = corsOptions.hasOwnProperty('dangerouslyAllowAll') ?
      corsOptions.dangerouslyAllowAll : false;

    let allowedOrigins = corsOptions.hasOwnProperty('allowedOrigins') ?
      corsOptions.allowedOrigins : [];

    var origin = req.get('Origin');

    if (origin !== undefined) {
      if (corsAllowAll || allowedOrigins.indexOf(origin) >= 0) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
      }
    } else if (corsAllowAll) {
      res.header("Access-Control-Allow-Origin", "*");
    }

    // Send headers
    if (corsOptions.hasOwnProperty('responseHeaders')) {
      corsOptions.responseHeaders.map(header => {
        res.header(header.key, header.value);
      });
    }

    // Send OPTIONS
    if (req.method.toLowerCase() === "options")
      return res.sendStatus(204);

    return callback(null);
  }

  /**
  * Create error to be passed for services handler. Usually we just bind HTTP
  * status code and related message. Method can be used also with normal errors,
  * which will be wrapped and passed.
  *
  * @param code
  * @param message or Error object
  * @return error
  */
  setError(code, message) {
    var error = typeof message === 'string' ?
      new Error(message) : message;
    error.code = code;
    return error;
  }
}

export default Resource;
