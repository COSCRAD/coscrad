import { Button, Card, CardContent, styled } from '@mui/material';

/**
 * Styling should be re-visited via the theme.  However, this feedback needs to
 * be clear and attract attention so the user doesn't get stuck before the
 * next action.
 */
const mainGreen = '#018416';

const StyledCard = styled(Card)({
    backgroundColor: '#a5ffb7',
    color: mainGreen,
});

interface AckNotificationProps {
    _onClick: () => void;
}

export const AckNotification = ({ _onClick: onClick }: AckNotificationProps): JSX.Element => (
    <StyledCard data-testid="command-succeeded-notification">
        <CardContent>
            The command has succeeded.
            <Button
                variant="contained"
                sx={{ ml: 2, color: '#fff', backgroundColor: mainGreen }}
                data-testid="command-ack-button"
                onClick={onClick}
            >
                OK
            </Button>
        </CardContent>
    </StyledCard>
);
