import { AggregateType, IValueAndDisplay } from '../aggregate-views';
import { FormFieldType } from './form-field-type.enum';

export interface IFormField<T = unknown> {
    type: FormFieldType;
    name: string;
    label: string;
    description: string;
    // TODO Correlate with form field type
    options?: IValueAndDisplay<T>[] | { aggregateType: AggregateType };
}
