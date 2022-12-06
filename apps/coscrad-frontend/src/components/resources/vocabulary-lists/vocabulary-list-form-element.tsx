import { FormFieldType, IFormField } from '@coscrad/api-interfaces';
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
}: VocabularyListFormElementProps): JSX.Element => {
    const { type } = formField;

    if (type !== FormFieldType.switch && type !== FormFieldType.staticSelect)
        return <div>Failed to build a form element for unsupporeted type: {type}</div>;

    return <VocabularyListSelect formField={formField} onNewSelection={onElementChange} />;
};
