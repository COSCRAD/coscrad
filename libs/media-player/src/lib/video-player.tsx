import { styled } from '@mui/material';

interface VideoPlayerProps {
    videoUrl: string;
}
const StyledVideoPlayer = styled('video')`
    border-radius: 5px;
    width: 100%;
`;

export const VideoPlayer = ({ videoUrl }: VideoPlayerProps) => {
    return (
        <StyledVideoPlayer controls>
            <source style={{ padding: 0 }} src={videoUrl} type="video/mp4" />
            <source style={{ padding: 0 }} src={videoUrl} type="video/webm" />
            Your browser does not support the video tag.
        </StyledVideoPlayer>
    );
};
