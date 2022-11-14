import { HasId } from './has-id.interface';

/**
 * We want to decouple `HasId` from `IBaseViewModel`, as eventually
 * the latter will have additional props and we do not want utilities
 * that only need an ID property to know about the additional props.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IBaseViewModel extends HasId {}
