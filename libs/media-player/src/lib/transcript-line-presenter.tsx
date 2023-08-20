import { Typography } from '@mui/material';

interface TranscriptLinePresenterProps {
    speakerInitials: string;
    text: string;
}

export const TranscriptLinePresenter = ({
    speakerInitials,
    text,
}: TranscriptLinePresenterProps): JSX.Element => {
    return (
        <Typography component="span" variant="body1">
            {speakerInitials}: {text}
        </Typography>
    );
};
