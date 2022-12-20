import { IFormField } from '@coscrad/api-interfaces';
import { Button, Card, CardContent, Divider, Stack, Tooltip } from '@mui/material';
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
                <Stack spacing={1}>
                    {fields.map((field) => (
                        <Tooltip title={field.description} arrow placement="right">
                            <div key={field.name}>
                                <DynamicFormElement
                                    formField={field}
                                    key={field.name}
                                    onElementChange={onFieldUpdate}
                                />
                            </div>
                        </Tooltip>
                    ))}
                </Stack>

                <Button onClick={() => onSubmitForm()}>Submit</Button>
            </CardContent>
        </Card>
    );
};
