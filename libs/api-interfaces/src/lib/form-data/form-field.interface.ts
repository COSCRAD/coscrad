import { AggregateType, IValueAndDisplay } from '../aggregate-views';
import { IFormFieldConstraint } from './form-field-constraint.interface';
import { FormFieldType } from './form-field-type.enum';

export interface IFormField<T = unknown> {
    type: FormFieldType;
    name: string;
    label: string;
    description: string;
    // TODO Correlate with form field type
    options?: IValueAndDisplay<T>[] | { aggregateType: AggregateType };
    constraints: IFormFieldConstraint[];
    /**
     * Sometimes we use a front-end view (e.g., an aggregate presenter) as a
     * form element. One use case is to allow an admin user to populate a command
     * form property by interacting with the model. For example, a user might interact
     * with a video timeline to set an `inPointMilliseconds` property on a command
     * form.
     *
     * The `sourceViewProperty` helps the front-end determine how to bind such
     * view state to a command payload.
     */
    sourceViewProperty?: string;
}
