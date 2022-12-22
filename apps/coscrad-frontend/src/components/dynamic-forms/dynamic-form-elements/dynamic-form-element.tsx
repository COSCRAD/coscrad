import { AggregateType, FormFieldType, HttpStatusCode, IFormField } from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../../error-display/error-display';
import { DynamicSelect } from './dynamic-select';
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
    const { type, options } = formField;

    if (type === FormFieldType.switch || type === FormFieldType.staticSelect)
        return <StaticSelect formField={formField} onNewSelection={onElementChange} />;

    if (type === FormFieldType.textField)
        return <TextInput formField={formField} onInputChange={onElementChange}></TextInput>;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184065964]
     * We need to 'transform' data to proper JSON on submit.
     */
    if (type === FormFieldType.jsonInput)
        return <TextInput formField={formField} onInputChange={onElementChange}></TextInput>;

    /**
     * TODO[https://www.pivotaltracker.com/story/show/184056535]
     * We need separate validation rules based on `CoscradDataTypes`<div className=""></div>
     */
    if (type === FormFieldType.numericInput)
        return <TextInput formField={formField} onInputChange={onElementChange}></TextInput>;

    if (type === FormFieldType.yearPicker) return <YearPicker formField={formField} />;

    if (type === FormFieldType.dynamicSelect) {
        return (
            <DynamicSelect
                aggregateType={
                    (options as unknown as { aggregateType: AggregateType }).aggregateType
                }
                simpleFormField={formField}
                onNewSelection={onElementChange}
            />
        );
    }

    const exhaustiveCheck: never = type;

    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message={`Failed to build a form element for unsupporeted type: ${exhaustiveCheck}`}
        />
    );
};
