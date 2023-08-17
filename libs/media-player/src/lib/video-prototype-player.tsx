import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface VideoPrototypePlayerProps {
    videoUrl: string;
}

enum VideoState {
    loading = 'loading',
    error = 'error',
    canPlay = 'canPlay',
    isMissingAudioLink = 'isMissingAudioLink',
    null = 'null',
}

export const VideoPrototypePlayer = ({ videoUrl }: VideoPrototypePlayerProps) => {
    const [videoState, setVideoState] = useState<VideoState>(VideoState.loading);

    const [isPlaying, setIsPlaying] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (isNullOrUndefined(videoRef.current)) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setVideoState(VideoState.isMissingAudioLink);
            return;
        }

        const onCanPlay = () => {
            setVideoState(VideoState.canPlay);
        };

        const onError = () => {
            setVideoState(VideoState.error);
        };

        /**
         * This video instance will never be played. We are using it to test whether
         * the URL is valid.
         */
        const testVideo = document.createElement('video');

        testVideo.src = videoUrl;

        testVideo.addEventListener('canplaythrough', onCanPlay);

        testVideo.addEventListener('error', onError);
    });

    return (
        <div>
            <Typography variant="body1" sx={{ mb: 1 }}>
                VideoPrototypePlayer State: {videoState}
            </Typography>
            <video ref={videoRef} controls>
                <source src={videoUrl} />
            </video>
            <Box>
                <Button onClick={togglePlay}>{isPlaying ? 'Pause' : 'Play'}</Button>
            </Box>
        </div>
    );
};
