import { IFormData } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, FormControl } from '@mui/material';
import {} from './';
import { VocabularyListFilter } from './vocabulary-list-detail.full-view.presenter';
import { VocabularyListFormElement } from './vocabulary-list-form-element';

type VocabularyListFormProps = IFormData & {
    onFormChange: (key: string, value: string | boolean) => void;
    formState: VocabularyListFilter;
};

export const VocabularyListForm = ({
    fields,
    onFormChange,
    formState,
}: VocabularyListFormProps): JSX.Element => (
    <Card>
        <CardHeader title="Filter the Vocabulary List" />
        <CardContent>
            <FormControl>
                {fields.map((field) => (
                    <VocabularyListFormElement
                        formField={field}
                        onElementChange={onFormChange}
                        formState={formState}
                    />
                ))}
            </FormControl>
        </CardContent>
    </Card>
);
