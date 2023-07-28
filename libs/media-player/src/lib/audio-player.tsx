/**
 * TODO We abandoned this previously. We should rename this `AudioPlayer` and
 * rename the file `audio-player.tsx` and re-implement the basic audio player
 * with controls. Until this is done, we will use the audio clip player even in
 * places where controls would be preferred.
 */

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
