import { FormFieldType, IFormField, IFormFieldConstraint } from '@coscrad/api-interfaces';
import {
    CoscradConstraint,
    isBoolean,
    isConstraintSatisfied,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { Box, Button, Card, CardContent, Divider, Stack, Tooltip } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';
import { ConstraintValidationResultPresenter } from './dynamic-form-elements/constraint-validator';

type DynamicFormProps = {
    commandType: string;
    fields: IFormField[];
    onSubmitForm: (fsa: { type: string; payload: Record<string, unknown> }) => void;
    onFieldUpdate: (propertyKey: string, propertyValue: unknown) => void;
    formState: Record<string, unknown>;
    bindProps: Record<string, unknown>;
};

const isOptionallyOmitted = (allConstraints: IFormFieldConstraint[], value) =>
    !allConstraints.map(({ name }) => name).includes(CoscradConstraint.isRequired) &&
    isNullOrUndefined(value);

const validateField = (field: IFormField, value: unknown): string[] =>
    field.constraints.reduce(
        (accValidationMessage: string[], constraint) =>
            isConstraintSatisfied(constraint.name as CoscradConstraint, value) ||
            isOptionallyOmitted(field.constraints, value)
                ? accValidationMessage
                : accValidationMessage.concat(
                      constraint.name === CoscradConstraint.isRequired
                          ? // TODO Move this logic to the back-end
                            '**required'
                          : constraint.message
                  ),
        []
    );

export const DynamicForm = ({
    commandType,
    fields,
    onSubmitForm,
    onFieldUpdate,
    formState,
    bindProps,
}: DynamicFormProps): JSX.Element => {
    const fieldNameToErrorMessages = fields.reduce(
        (acc, field) => acc.set(field.name, validateField(field, formState[field.name])),
        new Map<string, string[]>()
    );

    const isValid = fields
        .map(({ name }) => fieldNameToErrorMessages.get(name))
        .every((errorMessages) => errorMessages.length === 0);

    return (
        <Card>
            <CardContent>
                <Divider />

                <Stack spacing={1}>
                    {fields
                        .filter((field) => field.type !== FormFieldType.populatedFromView)
                        .map((field) => {
                            return (
                                <Tooltip
                                    key={field.name}
                                    title={field.description}
                                    arrow
                                    placement="right"
                                >
                                    <Box component={'div'}>
                                        {/* TODO Remove the following once we actually make use of the validation */}
                                        <ConstraintValidationResultPresenter
                                            errorMessages={fieldNameToErrorMessages.get(field.name)}
                                        />
                                        <DynamicFormElement
                                            formField={field}
                                            key={field.name}
                                            onElementChange={onFieldUpdate}
                                            currentValue={formState[field.name]}
                                            required={field.constraints.some(
                                                ({ name }) => name === CoscradConstraint.isRequired
                                            )}
                                        />
                                    </Box>
                                </Tooltip>
                            );
                        })}
                </Stack>
                {isBoolean(isValid) && isValid
                    ? null
                    : `Please correct the errors before submitting the form`}
                <Button
                    disabled={isBoolean(isValid) && !isValid}
                    data-testid="submit-dynamic-form"
                    onClick={() => {
                        if (!isValid) return;

                        onSubmitForm({
                            type: commandType,
                            payload: {
                                ...bindProps,
                                ...formState,
                            },
                        });
                    }}
                >
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
};
