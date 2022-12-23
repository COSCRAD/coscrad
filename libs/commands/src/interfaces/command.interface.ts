/**
 * TODO [https://www.pivotaltracker.com/story/show/184094873]
 * Every command should have a property called `aggregateCompositeIdentifier`,
 * which holds the composite identifier of the aggregate affected by the command.
 * In the case of an index-scoped command (e.g. CREATE_X), this will be
 * generated prior to command execution. In the case of a detail-scoped command,
 * it will be the composite identifier of the aggregate on whose view the command
 * was an `action`.
 */
export interface ICommand {}
