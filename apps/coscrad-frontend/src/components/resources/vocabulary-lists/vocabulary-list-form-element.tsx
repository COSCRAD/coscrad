import { FormFieldType, IFormField } from '@coscrad/api-interfaces';
import { VocabularyListCheckbox } from './vocabulary-list-checkbox';
import { VocabularyListSelect } from './vocabulary-list-select';

export const VocabularyListFormElement = (formField: IFormField): JSX.Element => {
    const { type, label, description } = formField;

    if (type === FormFieldType.switch) {
        return (
            <div>
                label: {label}
                <br />
                {description}
                <VocabularyListCheckbox {...formField} isChecked={true} />
            </div>
        );
    }

    if (type === FormFieldType.staticSelect) {
        return (
            <div>
                <VocabularyListSelect {...formField} />
            </div>
        );
    }

    return <div>Failed to build a form element for unsupporeted type: {type}</div>;
};
