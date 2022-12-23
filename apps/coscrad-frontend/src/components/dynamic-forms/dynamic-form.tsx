import { IFormField } from '@coscrad/api-interfaces';
import { Button, Card, CardContent, Divider, Stack, Tooltip } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';

type DynamicFormProps = {
    fields: IFormField[];
    onSubmitForm: () => void;
    onFieldUpdate: (propertyKey: string, propertyValue: unknown) => void;
    formState: Record<string, unknown>;
};

export const DynamicForm = ({
    fields,
    onSubmitForm,
    onFieldUpdate,
    formState,
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
                                    currentValue={formState[field.name]}
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
