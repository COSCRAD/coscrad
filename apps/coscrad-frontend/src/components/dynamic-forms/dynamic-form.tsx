import { IFormField } from '@coscrad/api-interfaces';
import { Button, Card, CardContent, Divider } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';

type DynamicFormProps = {
    fields: IFormField[];
    onSubmitForm: () => void;
    onFieldUpdate: (propertyKey: string, propertyValue: unknown) => void;
};

export const DynamicForm = ({
    fields,
    onSubmitForm,
    onFieldUpdate,
}: DynamicFormProps): JSX.Element => {
    return (
        <Card>
            <CardContent>
                <Divider />

                {fields.map((field) => (
                    <DynamicFormElement
                        formField={field}
                        key={field.name}
                        onElementChange={onFieldUpdate}
                    />
                ))}
                <Button onClick={() => onSubmitForm()}>Submit</Button>
            </CardContent>
        </Card>
    );
};
