import DomainMap from "domain-map"
import nodeUUID from "node-uuid"

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
  * Returns CSRF options
  *
  * @return csrf
  */
  getResourceCSRF() {
    // Local settings
    let state = this._registry.get('properties', 'state');
    if (state.hasOwnProperty('csrf'))
      return state.csrf;

    // Global settings
    state = this._registry.get('properties', 'serviceSettings');
    if (state.hasOwnProperty('csrf'))
      return state.csrf;

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
  * Handle access control for request.
  *
  * @param req
  * @param res
  * @param urlInfo
  *   Parsed url info.
  * @param callback
  */
  accessControl(req, res, urlInfo, callback) {
    // Handle request CORS methods
    this.accessControlCORS(req, res, urlInfo, err => {
      if (err) return callback(err);

      // Check CSRF token to prevent XSS attacks
      this.accessControlCSRF(req, res, urlInfo, err => {
        if (err)
          callback(err);
        else
          callback(null);
      });
    });
  }

  /**
  * Handle CORS request.
  *
  * @param req
  * @param res
  * @param callback
  */
  accessControlCORS(req, res, urlInfo, callback) {
    let corsOptions = this.getResourceCORS();

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
  * Handle CSRF token check.
  *
  * @param req
  * @param res
  * @param callback
  */
  accessControlCSRF(req, res, urlInfo, callback) {
    let csrfOptions = this.getResourceCSRF();

    if (!csrfOptions)
      return callback(null)

    let requireToken = csrfOptions.hasOwnProperty('requireToken') ?
      csrfOptions.requireToken : false;

    let safeMethods = csrfOptions.hasOwnProperty('safeMethods') ?
      csrfOptions.safeMethods : ["GET", "OPTIONS"];

    let tokenName = csrfOptions.hasOwnProperty('tokenName') ?
      csrfOptions.tokenName : 'x-csrf-token';

    if (!requireToken || safeMethods.indexOf(urlInfo.method) >= 0)
      return callback(null);

    if (this.isValidSessionToken(req, 'csrf', req.header(tokenName)))
      callback(null);
    else
      callback(new Error("CSRF token validation failed"));
  }

  /**
  * Returns current session token. If token doesn't exists, it will be created.
  *
  * @param req
  * @return created
  */
  getCurrentToken(req) {
    let token = this.getSessionToken(req, 'csrf');
    if (!token)
      token = this.setSessionToken(req, 'csrf')
    return token;
  }

  /**
  * Get session token. If token doesn't exists, it will be generated.
  *
  * @param req
  * @param tokenKey
  *   Token key for session
  */
  getSessionToken(req, tokenKey) {
    return req.session &&
      req.session.hasOwnProperty('rest_service_tokens') &&
      req.session.rest_service_tokens.hasOwnProperty(tokenKey) ?
        req.session.rest_service_tokens[tokenKey] : false;
  }

  /**
  * Set session token.
  *
  * @param req
  * @param tokenKey
  *   Token key for session
  * @param token
  */
  setSessionToken(req, tokenKey, token) {
    if (!req.session)
      return false;

    if (!req.session.hasOwnProperty('rest_service_tokens'))
      req.session.rest_service_tokens = {};

    if (token === undefined)
      token = nodeUUID.v4();

    req.session.rest_service_tokens[tokenKey] = token;
    return req.session.rest_service_tokens[tokenKey];
  }


  /**
  * Validate given session token.
  *
  * @param req
  * @param tokenKey
  * @param tokenValue
  *   Token to be validated.
  */
  isValidSessionToken(req, tokenKey, tokenValue) {
    return (tokenValue && this.getSessionToken(req, tokenKey) == tokenValue) ?
      true : false;
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
