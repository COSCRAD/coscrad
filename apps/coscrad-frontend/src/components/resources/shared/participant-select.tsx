import { ITranscriptParticipant } from '@coscrad/api-interfaces';
import { MenuItem, Select } from '@mui/material';

interface ParticipantSelectProps {
    transcriptParticipants: ITranscriptParticipant[];
    onSelectParticipantInitials: (initials: Pick<ITranscriptParticipant, 'initials'>) => void;
}

export const ParticipantSelect = ({
    transcriptParticipants,
    onSelectParticipantInitials,
}: ParticipantSelectProps) => {
    return (
        <Select
            data-testid={`select:participant`}
            label="Transcript Participant"
            onChange={(e) => {
                onSelectParticipantInitials(
                    e.target.value as Pick<ITranscriptParticipant, 'initials'>
                );
            }}
        >
            <MenuItem value="" key="placeholder">
                - Select Participant -
            </MenuItem>
            {transcriptParticipants.map(({ name, initials }) => (
                <MenuItem value={initials} key={initials}>
                    {name}
                </MenuItem>
            ))}
        </Select>
    );
};
