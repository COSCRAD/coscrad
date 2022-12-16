import { FormFieldType, HttpStatusCode, IFormField } from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../../error-display/error-display';
import { StaticSelect } from './static-select';
import { TextInput } from './text-input';
import { YearPicker } from './year-picker';

type VocabularyListFormElementProps = {
    formField: IFormField;
    onElementChange?: (key: string, value: string | boolean) => void;
};

export const DynamicFormElement = ({
    formField,
    onElementChange,
}: VocabularyListFormElementProps): JSX.Element => {
    const { type } = formField;

    if (type === FormFieldType.switch || type === FormFieldType.staticSelect)
        return <StaticSelect formField={formField} onNewSelection={onElementChange} />;

    if (type === FormFieldType.textField) return <TextInput formField={formField}></TextInput>;

    // TODO We need to 'transform' data to proper JSON on submit.
    if (type === FormFieldType.jsonInput) return <TextInput formField={formField}></TextInput>;

    // TODO We need separate validation rules based on `CoscradDataTypes`
    if (type === FormFieldType.numericInput) return <TextInput formField={formField}></TextInput>;

    if (type === FormFieldType.yearPicker) return <YearPicker formField={formField} />;

    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message={`Failed to build a form element for unsupporeted type: ${type}`}
        />
    );
};
