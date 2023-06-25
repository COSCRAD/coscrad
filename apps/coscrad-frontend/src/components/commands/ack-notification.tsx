import { Button, Card, CardContent } from '@mui/material';

interface AckNotificationProps {
    _onClick: () => void;
}

export const AckNotification = ({ _onClick: onClick }: AckNotificationProps): JSX.Element => (
    <Card>
        <CardContent>
            The command has succeeded.
            <Button data-testid="command-ack-button" onClick={onClick}>
                OK
            </Button>
        </CardContent>
    </Card>
);
