import { IFormField } from '@coscrad/api-interfaces';
import { Box, FormControl, FormHelperText, Stack } from '@mui/material';
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
    <Box sx={{ display: 'flex' }} mt={1} mb={1}>
        {/* TODO [https://www.pivotaltracker.com/story/show/184066412] Use `DynamicForm` for this */}
        {/* Alternate option is to pass the Stack component inline on FormControl */}

        <FormControl
            sx={{ minWidth: '160px', textTransform: 'capitalize', margin: '0 auto' }}
            size="small"
        >
            <Stack spacing={1}>
                {fields.map((field) => (
                    <VocabularyListFormElement
                        formField={field}
                        onElementChange={onFormChange}
                        formState={formState}
                        key={field.label + field.type}
                    />
                ))}
            </Stack>
            <FormHelperText>Filter Vocabulary List</FormHelperText>
        </FormControl>
    </Box>
);
