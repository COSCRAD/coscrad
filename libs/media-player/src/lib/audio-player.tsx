import { styled } from '@mui/material';

interface AudioPlayerProps {
    audioUrl: string;
}

const StyledAudioPlayer = styled('audio')`
    border-radius: 20px;
`;

export const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
    return (
        <StyledAudioPlayer controls>
            <source src={audioUrl} type="audio/ogg" />
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
        </StyledAudioPlayer>
    );
};
