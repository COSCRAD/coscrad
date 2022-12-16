import { IFormField } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';

type DynamicFormProps = {
    label: string;
    description: string;
    fields: IFormField[];
};

export const DynamicForm = ({ label, description, fields }: DynamicFormProps): JSX.Element => {
    return (
        <Card>
            <CardHeader title={label} />
            <CardContent>
                {description}
                <Divider />

                {fields.map((field) => (
                    <DynamicFormElement formField={field} key={field.name} />
                ))}
            </CardContent>
        </Card>
    );
};
