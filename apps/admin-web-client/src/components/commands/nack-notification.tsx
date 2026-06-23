import { IHttpErrorInfo } from '@coscrad/api-interfaces';
import { Button, Card, CardContent, Stack } from '@mui/material';

interface NackNotificationProps {
    _onClick: () => void;
    errorInfo: IHttpErrorInfo;
}

export const NackNotification = ({
    _onClick: onClick,
    errorInfo,
}: NackNotificationProps): JSX.Element => (
    <Card>
        <CardContent>
            <Stack spacing={1}>
                <h2>Error</h2>
                <p>The command has failed due to invalid input or state.</p>
                <h3>Details</h3>
                {/* @ts-expect-error fix types */}
                {errorInfo.message.error}
                <Button onClick={onClick}>OK</Button>
            </Stack>
        </CardContent>
    </Card>
);
