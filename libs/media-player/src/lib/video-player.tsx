import { styled } from '@mui/material';

export enum VideoMIMEType {
    videoMp4 = 'video/mp4',
    videoOgg = 'video/ogg',
    videoWebm = 'video/webm',
}

const isVideoMIMEType = (input: unknown): input is VideoMIMEType =>
    Object.values(VideoMIMEType).some((value) => value === (input as VideoMIMEType));

interface VideoPlayerProps {
    videoUrl: string;
    mimeType?: VideoMIMEType;
}

const StyledVideoPlayer = styled('video')`
    border-radius: 5px;
    width: 100%;
`;

export const VideoPlayer = ({ videoUrl, mimeType }: VideoPlayerProps) => {
    return (
        <StyledVideoPlayer controls>
            {isVideoMIMEType(mimeType) ? (
                <source
                    data-testid="video-player"
                    style={{ padding: 0 }}
                    src={videoUrl}
                    key={`${mimeType}`}
                    type={mimeType}
                />
            ) : (
                <>
                    {/* Fallbacks for each media type */}
                    {Object.values(VideoMIMEType).map((mimeType) => (
                        <source
                            data-testid="video-player"
                            style={{ padding: 0 }}
                            src={videoUrl}
                            key={`${mimeType}`}
                            type={mimeType}
                        />
                    ))}
                </>
            )}
            Your browser does not support the video tag.
        </StyledVideoPlayer>
    );
};
