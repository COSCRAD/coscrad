import { styled } from '@mui/material';

export enum VideoMIMEType {
    Ogg = 'video/ogg',
    MP4 = 'video/mp4',
    Webm = 'video/webm',
}

interface VideoPlayerProps {
    videoUrl: string;
    mimeType: VideoMIMEType;
}

const StyledVideoPlayer = styled('video')`
    border-radius: 5px;
    width: 100%;
`;

export const VideoPlayer = ({ videoUrl, mimeType }: VideoPlayerProps) => {
    return (
        <StyledVideoPlayer controls>
            <source style={{ padding: 0 }} src={videoUrl} type={mimeType} />
            Your browser does not support the video tag.
        </StyledVideoPlayer>
    );
};
