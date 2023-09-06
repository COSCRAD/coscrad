import { styled } from '@mui/material';

export enum AudioMIMEType {
    mp3 = 'audio/mpeg',
    audioMp4 = 'audio/mp4',
    audioOgg = 'audio/ogg',
    // TODO change this to audio/wav. This requires a migration
    wav = 'audio/x-wav',
    audioWebm = 'audio/webm',
}

const isAudioMIMEType = (input: unknown): input is AudioMIMEType =>
    Object.values(AudioMIMEType).some((value) => value === (input as AudioMIMEType));

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
                <source data-testid="audio-player" src={audioUrl} type={mimeType} />
            ) : (
                <>
                    {Object.values(AudioMIMEType).map((mimeType) => (
                        <source data-testid="audio-player" src={audioUrl} type={mimeType} />
                    ))}
                </>
            )}
            Your browser does not support the audio element.
        </StyledAudioPlayer>
    );
};
