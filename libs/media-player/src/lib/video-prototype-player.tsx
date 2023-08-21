import { ITranscript, LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    RestartAlt as RestartIcon,
} from '@mui/icons-material/';
import { Box, Button, LinearProgress, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { MediaCurrentTimeFormatted } from './timecode-formatted';
import { TimecodedTranscriptPresenter } from './timecoded-transcript-presenter';

const Video = styled('video')({
    flexShrink: 1,
    height: '100%',
    objectFit: 'cover',
});

const VideoControls = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

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

    const [videoLoadedState, setVideoLoadedState] = useState<VideoLoadedState>(
        VideoLoadedState.loading
    );

    const [isPlaying, setIsPlaying] = useState(false);

    const [mediaCurrentTimeForPresentation, setMediaCurrentTimeForPresentation] = useState(0);

    const [progress, setProgress] = useState(0);

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const togglePlay = () => {
        if (isNullOrUndefined(videoRef.current)) return;

        if (videoLoadedState === VideoLoadedState.loading) {
            // Video not yet loaded
        }
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const seekInMedia = (time: number) => {
        videoRef.current!.currentTime = time;
    };

    const seekInProgressBar = (event: React.MouseEvent<HTMLSpanElement>) => {
        console.log(
            `(${event.clientX - event.currentTarget.offsetLeft}) / ${
                event.currentTarget.offsetWidth
            }`
        );

        const percentProgressSelected =
            (event.clientX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth;
        console.log({ clientX: percentProgressSelected });

        const newMediaTime = percentProgressSelected * videoRef.current!.duration;

        seekInMedia(newMediaTime);

        updateProgressBarAndMediaCurrentTime(newMediaTime);
    };

    const handleProgress = () => {
        // const duration = videoRef.current!.duration;

        const currentTime = videoRef.current!.currentTime;

        updateProgressBarAndMediaCurrentTime(currentTime);

        // setMediaCurrentTime(currentTime);

        // const progress = (currentTime / duration) * 100;

        // setProgress(progress);
    };

    const updateProgressBarAndMediaCurrentTime = (time: number) => {
        const duration = videoRef.current!.duration;

        setMediaCurrentTimeForPresentation(time);

        const progress = (time / duration) * 100;

        setProgress(progress);
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setVideoLoadedState(VideoLoadedState.isMissingAudioLink);
            return;
        }

        const onCanPlay = () => {
            setVideoLoadedState(VideoLoadedState.canPlay);
        };

        const onError = () => {
            setVideoLoadedState(VideoLoadedState.error);
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
            <Video
                ref={videoRef}
                onTimeUpdate={handleProgress}
                width="100%"
                disablePictureInPicture
            >
                <source src={videoUrl} />
            </Video>
            <Box sx={{ mb: 2 }}>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: '10px' }}
                    onClick={(event) => {
                        seekInProgressBar(event);
                    }}
                />
                <VideoControls>
                    <Box>
                        {progress > 0 && (
                            <Button
                                onClick={() => {
                                    seekInMedia(0);
                                }}
                            >
                                <RestartIcon />
                            </Button>
                        )}
                        <Button onClick={togglePlay}>
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </Button>
                        <TimecodedTranscriptPresenter
                            transcript={transcript}
                            mediaCurrentTime={mediaCurrentTimeForPresentation}
                            selectedTranscriptLanguageCode={transcriptLanguageCode}
                        />
                    </Box>
                    <Box>
                        <MediaCurrentTimeFormatted
                            mediaCurrentTime={mediaCurrentTimeForPresentation}
                        />
                    </Box>
                </VideoControls>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    currentTime: {mediaCurrentTimeForPresentation} &nbsp; State: {videoLoadedState}
                </Typography>
            </Box>
        </Box>
    );
};
