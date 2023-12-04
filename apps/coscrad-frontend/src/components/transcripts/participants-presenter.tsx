import { ITranscriptParticipant } from '@coscrad/api-interfaces';
import { Divider, Typography } from '@mui/material';

interface ParticipantsPresenterProps {
    participants: ITranscriptParticipant[];
}

export const ParticipantsPresenter = ({ participants }: ParticipantsPresenterProps) => {
    return (
        <>
            <Typography variant="h4">Participants:</Typography>

            {participants.map(({ initials, name }: ITranscriptParticipant) => (
                <Typography key={initials} variant="body1">
                    {name} ({initials})
                </Typography>
            ))}

            <Divider sx={{ marginY: 2 }} />
        </>
    );
};
