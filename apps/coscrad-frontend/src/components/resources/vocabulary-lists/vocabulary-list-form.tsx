import { IFormField } from '@coscrad/api-interfaces';
import { Box, FormControl, Stack, Typography } from '@mui/material';
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
    <Box mb={1}>
        <Typography variant="h4">Filter the Vocabulary List</Typography>
        {/* TODO [https://www.pivotaltracker.com/story/show/184066412] Use `DynamicForm` for this */}
        {/* Alternate option is to pass the Stack component inline on FormControl */}
        <FormControl
            sx={{
                width: '548px',
                '@media (max-width: 700px)': {
                    width: '100%',
                },
            }}
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
        </FormControl>
    </Box>
);
