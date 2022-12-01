import { IFormData } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, FormControl } from '@mui/material';
import {} from './';
import { VocabularyListFormElement } from './vocabulary-list-form-element';

export const VocabularyListForm = ({ fields }: IFormData): JSX.Element => (
    <Card>
        <CardHeader title="Filter the Vocabulary List" />
        <CardContent>
            <FormControl>
                {fields.map((field) => (
                    <VocabularyListFormElement {...field} />
                ))}
            </FormControl>
        </CardContent>
    </Card>
);
