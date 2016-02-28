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
  constructor(variables) {
    if (variables == undefined) variables = {};

    this._registry = new DomainMap();

    if (variables.hasOwnProperty('context'))
      this._registry.set('properties', 'context', variables.context);

    this._registry.set('properties', 'state', this.getInitialState());
  }

  /**
  * Returns initial state.
  *
  * @return data
  */
  getInitialState() {
    return {
      props: {
        resource_id: false
      },
      resource_definition: {
        operations: {},
        actions: {},
        targeted_actions: {}
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
  * Create item
  *
  * @param data
  */
  create(data) {

  }

  /**
  * Read item.
  *
  * @param id
  */
  read(id) {

  }

  /**
  * Update item.
  *
  * @param id
  * @param data
  */
  update(id, data) {

  }

  /**
  * Delete item.
  *
  * @param id
  */
  del(id) {

  }

  /**
  * Resource enabled
  *
  * @param selector
  *   type
  *   method
  */
  resourceEnabled(selector) {
    // TODO: fix to use app.config
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
    let state = this._registry.get('properties', 'state');
    return (state.resource_definition.hasOwnProperty(type) &&
            state.resource_definition[type].hasOwnProperty(operation)) ?
                state.resource_definition[type][operation] : false;
  }

  /**
  * Returns resource identifier.
  *
  * @return id
  */
  getResourceID() {
    let state = this._registry.get('properties', 'state');
    return state.props.resource_id;
  }


  /**
  * Resource definition contains information about service methods
  * and related operations.
  *
  * @return data
  */
  resourceDefinition() {
    let state = this._registry.get('properties', 'state');
    return state.resource_definition;
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
}

export default Resource;
