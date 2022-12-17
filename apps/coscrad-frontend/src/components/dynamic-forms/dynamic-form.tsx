import { IFormField } from '@coscrad/api-interfaces';
import { Button, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';

type DynamicFormProps = {
    label: string;
    description: string;
    fields: IFormField[];
    // TODO type this
    onSubmitForm: () => void;
    onFieldUpdate: (propertyKey: string, propertyValue: unknown) => void;
};

export const DynamicForm = ({
    label,
    description,
    fields,
    onSubmitForm,
    onFieldUpdate,
}: DynamicFormProps): JSX.Element => {
    return (
        <Card>
            <CardHeader title={label} />
            <CardContent>
                {description}
                <Divider />

                {fields.map((field) => (
                    <DynamicFormElement
                        formField={field}
                        key={field.name}
                        onElementChange={onFieldUpdate}
                    />
                ))}
                {/* TODO Inject form state */}
                <Button onClick={() => onSubmitForm()}>Submit</Button>
            </CardContent>
        </Card>
    );
};
