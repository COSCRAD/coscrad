import { ITranscript } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Pause as PauseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material/';
import { Box, Button, LinearProgress, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TimecodedTranscriptPresenter } from './timecoded-transcript-presenter';

const Video = styled('video')({
    flexShrink: 1,
    height: '100%',
    objectFit: 'cover',
});

interface VideoPrototypePlayerProps {
    videoUrl: string;
    transcript: ITranscript;
}

enum VideoLoadedState {
    loading = 'loading',
    error = 'error',
    canPlay = 'canPlay',
    isMissingAudioLink = 'isMissingAudioLink',
    null = 'null',
}

export const VideoPrototypePlayer = ({
    videoUrl,
    transcript,
}: VideoPrototypePlayerProps): JSX.Element => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [videoState, setVideoState] = useState<VideoLoadedState>(VideoLoadedState.loading);

    const [isPlaying, setIsPlaying] = useState(false);

    const [currentTimeCode, setCurrentTimecode] = useState(0);

    const [progress, setProgress] = useState(0);

    const togglePlay = () => {
        if (isNullOrUndefined(videoRef.current)) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleProgress = () => {
        if (isNullOrUndefined(videoRef.current)) return;

        const duration = videoRef.current.duration;

        const currentTime = videoRef.current.currentTime;

        setCurrentTimecode(currentTime);

        const progress = (currentTime / duration) * 100;

        setProgress(progress);
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setVideoState(VideoLoadedState.isMissingAudioLink);
            return;
        }

        const onCanPlay = () => {
            setVideoState(VideoLoadedState.canPlay);
        };

        const onError = () => {
            setVideoState(VideoLoadedState.error);
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
        <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
                VideoPrototypePlayer State: {videoState}
            </Typography>
            <Video
                ref={videoRef}
                onTimeUpdate={handleProgress}
                width="100%"
                disablePictureInPicture
            >
                <source src={videoUrl} />
            </Video>
            <Box sx={{ mb: 2 }}>
                <LinearProgress variant="determinate" value={progress} />
                <Button onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </Button>
            </Box>
            <TimecodedTranscriptPresenter
                transcript={transcript}
                mediaCurrentTime={currentTimeCode}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
                <pre>Subtitle Stream: {JSON.stringify(transcript, null, 2)}</pre>
            </Typography>
        </Box>
    );
};
