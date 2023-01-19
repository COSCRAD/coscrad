interface ConstraintValidationProps {
    errorMessages: string[];
}

// TODO block submission if the validation fails.
export const ConstraintValidationResultPresenter = ({
    errorMessages,
}: ConstraintValidationProps): JSX.Element => {
    return (
        <div>{errorMessages.length === 0 ? '' : `Invalid input: ${errorMessages.join(', ')}`}</div>
    );
};
