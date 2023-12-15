import { styled } from '@mui/material';
import { AudioMIMEType } from './shared/audio-mime-type.enum';
import { isAudioMIMEType } from './shared/is-audio-mime-type';

interface AudioPlayerProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
}

const StyledAudioPlayer = styled('audio')`
    border-radius: 20px;
`;

export const AudioPlayer = ({ audioUrl, mimeType }: AudioPlayerProps) => {
    return (
        <StyledAudioPlayer controls>
            {isAudioMIMEType(mimeType) ? (
                <source key={mimeType} src={audioUrl} type={mimeType} />
            ) : (
                <>
                    {Object.values(AudioMIMEType).map((mimeType) => (
                        <source key={mimeType} src={audioUrl} type={mimeType} />
                    ))}
                </>
            )}
            Your browser does not support the audio element.
        </StyledAudioPlayer>
    );
};
