import { IFormField } from '@coscrad/api-interfaces';
import { FormControl, Typography } from '@mui/material';
import { VocabularyListFilter } from './vocabulary-list-detail.full-view.presenter';
import { VocabularyListFormElement } from './vocabulary-list-form-element';

type VocabularyListFormProps = {
    fields: IFormField[];
    onFormChange: (key: string, value: string | boolean) => void;
    formState: VocabularyListFilter;
};

export const VocabularyListForm = ({
    fields,
    onFormChange,
    formState,
}: VocabularyListFormProps): JSX.Element => (
    <Typography component={'div'}>
        <Typography variant="h4" component={'div'}>
            Filter the Vocabulary List
        </Typography>
        <Typography component={'div'} sx={{ margin: 'auto', textAlign: 'center' }}>
            {/* TODO [https://www.pivotaltracker.com/story/show/184066412] Use `DynamicForm` for this */}
            <FormControl sx={{ minWidth: '200px', maxWidth: '100%' }} size="small">
                {fields.map((field) => (
                    <VocabularyListFormElement
                        formField={field}
                        onElementChange={onFormChange}
                        formState={formState}
                        key={field.label + field.type}
                    />
                ))}
            </FormControl>
        </Typography>
    </Typography>
);
