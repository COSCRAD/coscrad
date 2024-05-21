import { ITranscriptParticipant } from '@coscrad/api-interfaces';
import { InputLabel, MenuItem, Select } from '@mui/material';

interface ParticipantSelectProps {
    transcriptParticipants: ITranscriptParticipant[];
    onSelectParticipantInitials: (initials: string) => void;
}

export const ParticipantSelect = ({
    transcriptParticipants,
    onSelectParticipantInitials,
}: ParticipantSelectProps) => {
    return (
        <>
            <InputLabel id="participant-select-label">Transcript Participant</InputLabel>
            <Select
                data-testid={`select:participant`}
                label="Transcript Participant"
                onChange={(e) => {
                    onSelectParticipantInitials(e.target.value as string);
                }}
            >
                {transcriptParticipants.map(({ name, initials }) => (
                    <MenuItem value={initials} key={initials}>
                        {name}
                    </MenuItem>
                ))}
            </Select>
        </>
    );
};
