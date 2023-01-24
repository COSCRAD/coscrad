import { IFormField, IFormFieldConstraint } from '@coscrad/api-interfaces';
import {
    CoscradConstraint,
    isBoolean,
    isConstraintSatisfied,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { Button, Card, CardContent, Divider, Stack, Tooltip } from '@mui/material';
import { DynamicFormElement } from './dynamic-form-elements';
import { ConstraintValidationResultPresenter } from './dynamic-form-elements/constraint-validator';

type DynamicFormProps = {
    fields: IFormField[];
    onSubmitForm: () => void;
    onFieldUpdate: (propertyKey: string, propertyValue: unknown) => void;
    formState: Record<string, unknown>;
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
    fields,
    onSubmitForm,
    onFieldUpdate,
    formState,
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
                    {fields.map((field) => {
                        return (
                            <Tooltip title={field.description} arrow placement="right">
                                <div key={field.name}>
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
                                </div>
                            </Tooltip>
                        );
                    })}
                </Stack>
                {isBoolean(isValid) && isValid
                    ? null
                    : `Please correct the errors before submitting the form`}
                <Button
                    onClick={() => {
                        if (!isValid) return;

                        onSubmitForm();
                    }}
                >
                    Submit
                </Button>
            </CardContent>
        </Card>
    );
};
