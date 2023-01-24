interface ConstraintValidationProps {
    errorMessages: string[];
}

export const ConstraintValidationResultPresenter = ({
    errorMessages,
}: ConstraintValidationProps): JSX.Element => {
    return (
        <div>{errorMessages.length === 0 ? '' : `Invalid input: ${errorMessages.join(', ')}`}</div>
    );
};
