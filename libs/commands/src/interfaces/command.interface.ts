/**
 * As a matter of our specific implementation, we have decided that every command
 * will have an `aggregateCompositeIdentifier` property to track the aggregate
 * ID. We introduce this to our domain by extending the following in the
 * `api-interfaces` layer.
 */
export interface ICommand {}
