import { ITranscript, LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material/';
import { Box, IconButton, LinearProgress, Tooltip, Typography, styled } from '@mui/material';
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

enum VideoVerifiedState {
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

    const [videoVerifiedState, setVideoVerifiedState] = useState<VideoVerifiedState>(
        VideoVerifiedState.loading
    );

    const [isPlaying, setIsPlaying] = useState(false);

    const [mediaCurrentTimeForPresentation, setMediaCurrentTimeForPresentation] = useState(0);

    const [progress, setProgress] = useState(0);

    const [buffer, setBuffer] = useState(0);

    const [inPoint, setInPoint] = useState(0);

    const [outPoint, setOutPoint] = useState(0);

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const togglePlay = () => {
        if (videoVerifiedState === VideoVerifiedState.loading) {
            // Video not yet loaded
        }
        if (isPlaying) {
            videoRef.current!.pause();
        } else {
            videoRef.current!.play();
        }
        setIsPlaying(!isPlaying);
    };

    const seekInMedia = (time: number) => {
        videoRef.current!.currentTime = time;
    };

    const seekInProgressBar = (event: React.MouseEvent<HTMLSpanElement>) => {
        const percentProgressSelected =
            (event.clientX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth;

        const newMediaTime = percentProgressSelected * videoRef.current!.duration;

        seekInMedia(newMediaTime);

        updateProgressBarAndMediaCurrentTime(newMediaTime);
    };

    const restartMedia = () => {
        seekInMedia(0);

        if (isPlaying) {
            togglePlay();
        }
    };

    const handlePlayProgress = () => {
        const currentTime = videoRef.current!.currentTime;

        updateProgressBarAndMediaCurrentTime(currentTime);
    };

    const updateProgressBarAndMediaCurrentTime = (time: number) => {
        const duration = videoRef.current!.duration;

        setMediaCurrentTimeForPresentation(time);

        const progress = (time / duration) * 100;

        setProgress(progress);
    };

    const markInPoint = () => {
        setInPoint(videoRef.current!.currentTime);
    };

    const markOutPoint = () => {
        setOutPoint(videoRef.current!.currentTime);
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setVideoVerifiedState(VideoVerifiedState.isMissingAudioLink);
            return;
        }

        const onCanPlay = () => {
            setVideoVerifiedState(VideoVerifiedState.canPlay);
        };

        const onError = () => {
            setVideoVerifiedState(VideoVerifiedState.error);
        };

        /**
         * This video instance will never be played. We are using it to test whether
         * the URL is valid.
         */
        const testVideo = document.createElement('video');

        testVideo.src = videoUrl;

        testVideo.addEventListener('canplaythrough', onCanPlay);

        testVideo.addEventListener('error', onError);

        videoRef.current!.addEventListener('progress', () => {
            const bufferedVideo = videoRef.current!.buffered;

            const bufferedVideoLength = bufferedVideo.length;

            const bufferedEnd =
                bufferedVideoLength > 0 ? bufferedVideo.end(bufferedVideoLength - 1) : 0;

            const videoDuration = videoRef.current!.duration;

            setBuffer((bufferedEnd / videoDuration) * 100);
        });

        document.addEventListener('keydown', (event) => {
            const keys = ['i', 'o', 'j', 'k'];

            const wasAnyKeyPressed = keys.some((key) => event.key === key);

            if (wasAnyKeyPressed) {
                switch (event.key) {
                    case 'i':
                        markInPoint();
                        break;
                    case 'o':
                        markOutPoint();
                        break;
                }
            }
        });
    }, [videoRef]);

    return (
        <Box>
            <Video
                ref={videoRef}
                onTimeUpdate={handlePlayProgress}
                onClick={togglePlay}
                width="100%"
                disablePictureInPicture
            >
                <source src={videoUrl} />
            </Video>
            <Box sx={{ mb: 2 }}>
                {/* With the buffer variant you get an annoying blinking dash bar
                    we may want to make our own simpler one. */}
                <LinearProgress
                    variant="buffer"
                    value={progress}
                    valueBuffer={buffer}
                    sx={{ height: '10px' }}
                    onClick={(event) => {
                        seekInProgressBar(event);
                    }}
                />
                <VideoControls>
                    <Box>
                        {/* Note: the tooltip on the disabled button generates an error.  There's a 
                            discussion (https://github.com/mui/material-ui/issues/8416) that still seems
                            to be unresolved.  This: https://github.com/mui/material-ui/issues/8416#issuecomment-1294989582
                            seems correct for UI design, that tooltips should appear regardless of a button's disabled status 
                        */}
                        <Tooltip title="Restart Media">
                            <IconButton onClick={restartMedia} disabled={progress === 0}>
                                <ReplayIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={isPlaying ? 'Pause Media' : 'Play Media'}>
                            <IconButton onClick={togglePlay}>
                                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
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
                <Typography variant="body2">
                    InPoint: {inPoint} &nbsp; OutPoint: {outPoint}
                </Typography>
            </Box>
        </Box>
    );
};
