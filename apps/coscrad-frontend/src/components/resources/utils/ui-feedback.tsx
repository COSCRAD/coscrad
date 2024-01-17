import { Typography, styled } from '@mui/material';

const StyledMessage = styled(Typography)({
    padding: '10px',
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: '#A40011',
    borderRadius: '4px',
});

interface UIFeedbackProps {
    feedbackMessage: string;
}

export const UIFeedback = ({ feedbackMessage }: UIFeedbackProps): JSX.Element => (
    <StyledMessage data-testid="note-form-ui-feedback">{feedbackMessage}</StyledMessage>
);
