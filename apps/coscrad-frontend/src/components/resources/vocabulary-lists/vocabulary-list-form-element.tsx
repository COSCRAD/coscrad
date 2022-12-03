import { FormFieldType, IFormField } from '@coscrad/api-interfaces';
import { VocabularyListCheckbox } from './vocabulary-list-checkbox';
import { VocabularyListFilter } from './vocabulary-list-detail.full-view.presenter';
import { VocabularyListSelect } from './vocabulary-list-select';

type VocabularyListFormElementProps = {
    formField: IFormField;
    onElementChange: (key: string, value: string | boolean) => void;
    formState: VocabularyListFilter;
};

export const VocabularyListFormElement = ({
    formField,
    onElementChange,
    formState,
}: VocabularyListFormElementProps): JSX.Element => {
    const { type, name } = formField;

    if (type === FormFieldType.switch) {
        const currentState = formState[name];

        const isChecked = typeof currentState === 'boolean' ? currentState : false;

        return (
            <div>
                <VocabularyListCheckbox
                    {...formField}
                    onIsCheckedChange={onElementChange}
                    isChecked={isChecked}
                />
            </div>
        );
    }

    if (type === FormFieldType.staticSelect) {
        return (
            <div>
                <VocabularyListSelect formField={formField} onNewSelection={onElementChange} />
            </div>
        );
    }

    return <div>Failed to build a form element for unsupporeted type: {type}</div>;
};
