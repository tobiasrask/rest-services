import DomainMap from 'domain-map'
import url from 'url'

class ServiceHandler {

  /**
  * Constructor
  *
  * @param options
  *   Service options
  * @param master
  *   Reference to master instance, typically this is RestServices.
  */
  constructor(options, master) {
    var self = this
    this._options = options
    this._master = master
    this._registry = new DomainMap()

    if (!options.hasOwnProperty('resources')) {
      options.resources = []
    }
    if (!options.hasOwnProperty('settings')) {
      options.settings = []
    }

    options.resources.map((Resource) => {
      var resource = new Resource({
        context: 'server',
        serviceSettings: options.settings
      })
      this._registry.set('resources', resource.getResourceID(), resource)
      self._master.log(`Resource ${resource.getResourceID()} registered`)
    })
  }

  /**
  * Returns list of installed resources
  *
  * @return resources
  */
  getResourceIdentifiers() {
    return this._registry.getDomainKeysList('resources', [])
  }

  /**
  * Get resource by id
  *
  * @param resourceId
  * @return resource id
  */
  getResource(resourceId) {
    return this._registry.get('resources', resourceId)
  }

  /**
  * Get service path
  *
  * @return servicePath
  */
  getServiceName() {
    return this._options.serviceName
  }

  /**
  * Get service path
  *
  * @return servicePath
  */
  getServicePath() {
    return this._options.servicePath
  }

  /**
  * Services lookup maps incoming request to certain endpoint.
  * TODO: Use promises to clean this code.
  *
  * @param req
  * @param res
  * @param callback
  */
  lookup(req, res, callback) {
    var self = this
    let urlInfo = this.getUrlInfo(req)

    var resource = this.getResource(urlInfo.resourceId)
    if (!resource) {
      return callback(self.buildError(404, 'Resource not found'))
    }

    var selector = this.buildSelector(urlInfo)
    if (!selector) {
      return callback(self.buildError(500, `No selector for url: ${urlInfo}`))
    }

    if (!resource.resourceEnabled(selector)) {
      return callback(self.buildError(500, 'Resource is not available'))
    }

    // Check access control like CORS and CSRF
    resource.accessControl(req, res, urlInfo, (err) => {
      if (err) {
        callback(self.buildError(500, err.toString()))
      }

      // Fetch resource info and preprocess incoming arguments
      var endpoint = resource.getEndpointInfo(selector)
      if (!endpoint) {
        return callback(self.buildError(404, 'Resource endpoint not found'))
      }

      // Build arguments for resource
      var args = this.processArguments(req, urlInfo, endpoint.arguments)

      if (!args) {
        return callback(self.buildError(400, 'Unable to process resource arguments'))
      }

      args._req = req
      args._res = res
      args._urlInfo = urlInfo

      self._master.log(`Executing '${selector.type}' / '${selector.operation}'`)

      // Hook lookupAlter()
      self.lookupAlter(endpoint, selector, args, (err) => {
        if (err) {
          return callback(err)
        }

        // Hook endpointAccess()
        self.endpointAccess(endpoint, selector, args, (err, hasAccess) => {
          if (err) {
            return callback(err)
          } else if (!hasAccess) {
            return callback(self.buildError(401, 'Access to this endpoint is denied'))
          }

          // Hook cacheControlEnabled()
          const cache_control = resource.cacheControlEnabled(selector)
          if (cache_control) {
            res.locals._cache_control = cache_control
          }

          // Pass execution to endpoint
          endpoint.callback(args, callback)
        })
      })
    })
  }

  /**
  * Fetch information about requested url.
  *
  * @param req
  * @return urlInfo
  */
  getUrlInfo(req) {
    let baseIndex = 0
    let parsedUrl = url.parse(req.originalUrl)
    let urlParts = parsedUrl.pathname.split('/')
    return {
      method: req.method,
      originalUrl: req.originalUrl,
      parsedUrl: parsedUrl,
      urlParts: urlParts,
      baseIndex: baseIndex,
      service_domain: urlParts[baseIndex + 1],
      resourceId: urlParts[baseIndex + 2],
      resourceIdentifier: urlParts[baseIndex + 3],
      resourceSpecifier: urlParts[baseIndex + 4]
    }
  }

  /**
  * Method returns controller selector based on given urlInfo.
  *
  * @param urlInfo
  * @return controller selector
  *   Object with keys 'type' and 'operation'
  */
  buildSelector(urlInfo) {
    var selector = false

    if (urlInfo.method == 'GET') {
      if (urlInfo.resourceIdentifier !== undefined) {
        selector = {
          type: 'operations',
          operation: 'retrieve'
        }
      } else {
        selector = {
          type: 'operations',
          operation: 'index'
        }
      }
    } else if (urlInfo.method == 'POST') {
      if (urlInfo.resourceIdentifier !== undefined &&
          urlInfo.resourceSpecifier !== undefined) {
        selector = {
          type: 'targetedActions',
          operation: urlInfo.resourceSpecifier
        }
      } else if (urlInfo.resourceIdentifier !== undefined) {
        selector = {
          type: 'actions',
          operation: urlInfo.resourceIdentifier
        }
      } else {
        selector = {
          type: 'operations',
          operation: 'create'
        }
      }
    } else if (urlInfo.method == 'PUT') {
      if (urlInfo.resourceIdentifier !== undefined) {
        selector = {
          type: 'operations',
          operation: 'update'
        }
      }
    } else if (urlInfo.method == 'DELETE') {
      if (urlInfo.resourceIdentifier !== undefined) {
        selector = {
          type: 'operations',
          operation: 'delete'
        }
      }
    } else if (urlInfo.method == 'OPTIONS') {
      if (urlInfo.resourceIdentifier !== undefined) {
        selector = {
          type: 'operations',
          operation: 'options'
        }
      }
    }
    return selector
  }

  /**
  * Argument definitions.
  *
  * @param req
  *   Request object
  * @param urlInfo
  *   Url info
  * @param definitions
  *   Resource endpoint argument definitions.
  * @return args
  */
  processArguments(req, urlInfo, definitions) {
    var self = this
    var args = {}

    definitions.map((defArg) => {
      let optional = defArg.hasOwnProperty('optional') ?
        defArg['optional'] : false

      let type = defArg.hasOwnProperty('type') ? defArg['type'] : null

      let source = defArg.hasOwnProperty('source') ? defArg['source'] : null

      let name = defArg.hasOwnProperty('name') ? defArg['name'] : null

      let value = defArg.hasOwnProperty('defaultValue') ?
        defArg.defaultValue : null

      if (name == null || source == null) {
        self._master.log('services_handler',
          'Unable to fetch name or source for resource argument', 'error')
        return false
      }

      if (typeof source === 'string') {
        if (source === 'data') {
          value = req.body
        }
      } else {
        if (source.hasOwnProperty('path')) {
          // Url path
          let url_position = urlInfo.baseIndex + 3 + source.path
          value = urlInfo.urlParts[url_position]

        } else if (source.hasOwnProperty('param')) {
          // Url query parameter
          if (req.query.hasOwnProperty(source.param)) {
            value = req.query[source.param]
          }

        } else if (source.hasOwnProperty('data')) {
          // Payload
          if (req.body !== undefined && req.body.hasOwnProperty(source.param)) {
            value = req.body[source.param]
          }
        }
      }

      if (!optional && value == null) {
        // Argument not provided
        return false
      }

      // Typecasts
      if (type != null) {
        if (type == 'int') {
          value = !Number.isNaN(value) ? parseInt(value) : null
        }
      }
      args[name] = value
    })
    return args
  }

  /**
  * Hook lookupAlter() is executed before access checks, and allows you to load
  * custom data for resource. If your endpoint needs XSS checks, CSRF tokens etc
  * insert those here.
  *
  * @param endpoint
  * @param selector
  * @param args
  * @param callback
  */
  lookupAlter(endpoint, selector, args, callback) {
    callback(null)
  }

  /**
  * Check user access to endpoint.
  *
  * @param endpoint
  * @param selector
  * @param args
  * @param callback
  *   Pass boolean value to indicate if endpoint is available.
  */
  endpointAccess(endpoint, selector, args, callback) {
    return callback(null, true)
  }

  /**
  * Create error to be passed for services handler.
  * We apply http status code and message. Method can be used also
  * with normal errors, which will be wrapped and passed.
  *
  * @param code
  * @param message or Error object
  * @return error
  */
  buildError(code, message) {
    var error = typeof message === 'string' ? new Error(message) : message
    error.code = code
    return error
  }
}

export default ServiceHandler
