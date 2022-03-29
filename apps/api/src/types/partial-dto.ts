import { DataPropertyNames } from './data-property-names';

/**
 * We follow the approach [here](https://bigfont.ca/data-transfer-object-wrapper/)
 * This type corresponds to a `data transfer object` in which all methods have
 * been removed from the instance and all properties are `optional`. While one
 * can define a separate `createDTO`and `updateDTO` which may differ in which
 * properties are required \ present, we elect to defer such distinction dynamically
 * to dto validation in our instance factories (currently the model constructors).
 */

/**
 * Converts the type of an instance of a model to a `DTO` for said model,
 * in which all properties (fields) are optional and all methods have been removed.
 */
export type PartialDTO<T> = {
    // Recurse on all objects
    [P in DataPropertyNames<T>]?: T[P] extends object ? PartialDTO<T[P]> : T[P];
};
