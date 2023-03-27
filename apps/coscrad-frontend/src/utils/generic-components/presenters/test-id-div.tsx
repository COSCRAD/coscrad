interface TestIdDivProps {
    testId: string;
}

export const TestIdDiv = ({ testId }: TestIdDivProps): JSX.Element => (
    <div style={{ height: '1px' }} data-testid={testId}>
        &nbsp;
    </div>
);
