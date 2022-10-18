import { ClassSchema } from '@coscrad/data-types';

/**
 * We may want to move our `AggregateType` enum definition into the api-interfaces
 * layer. Until then, we will "inject" the type into the generic on the backend,
 * but leave it as a string on the frontend.
 */
export interface IAggregateInfo<TAggregateType extends string = string> {
    type: TAggregateType;
    description: string;
    label: string;
    schema: ClassSchema;
    link: string;
}
