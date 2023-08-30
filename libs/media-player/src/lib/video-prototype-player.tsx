import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material/';
import { Box, IconButton, LinearProgress, Tooltip, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedCurrentTime } from './formatted-currenttime';
import { LanguageCode } from './language-code.enum';
import { SubtitlesByTime } from './subtitles-by-time';

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

enum VideoVerifiedState {
    loading = 'loading',
    error = 'error',
    canPlay = 'canPlay',
    isMissingAudioLink = 'isMissingAudioLink',
    null = 'null',
}

type MediaState = {
    loadStatus: VideoVerifiedState;
    duration: number;
    buffer: number;
    isPlaying: boolean;
    currentTime: number;
    progress: number;
    playWithSubtitles: boolean;
};

type MultiLingualTextItem = {
    languageCode: LanguageCode;
    text: string;
};

export type Subtitle = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    textVersions: MultiLingualTextItem[];
    speakerInitials: string;
};

interface VideoPrototypePlayerProps {
    videoUrl: string;
    subtitles: Subtitle[];
    onTimeUpdateHandler?: (currentTime: number) => void;
}

export const VideoPrototypePlayer = ({
    videoUrl,
    subtitles,
    onTimeUpdateHandler,
}: VideoPrototypePlayerProps): JSX.Element => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [mediaState, setMediaState] = useState<MediaState>({
        loadStatus: VideoVerifiedState.loading,
        duration: 0,
        buffer: 0,
        isPlaying: false,
        currentTime: 0,
        progress: 0,
        playWithSubtitles: isNullOrUndefined(onTimeUpdateHandler) ? true : false,
    });

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const togglePlay = () => {
        if (mediaState.loadStatus === VideoVerifiedState.loading) {
            // Video not yet loaded
        }
        if (mediaState.isPlaying) {
            videoRef.current!.pause();
        } else {
            videoRef.current!.play();
        }
        setMediaState({ ...mediaState, isPlaying: !mediaState.isPlaying });
    };

    const handlePlayProgress = () => {
        const currentTime = videoRef.current!.currentTime;

        const progress = (currentTime / mediaState.duration) * 100;

        setMediaState({ ...mediaState, progress: progress, currentTime: currentTime });

        if (!mediaState.playWithSubtitles) {
            onTimeUpdateHandler!(currentTime);
        }
    };

    const seekInMedia = (time: number) => {
        videoRef.current!.currentTime = time;

        setMediaState({ ...mediaState, currentTime: videoRef.current!.currentTime });
    };

    const seekInProgressBar = (event: React.MouseEvent<HTMLSpanElement>) => {
        const percentProgressSelected =
            (event.clientX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth;

        const newMediaTime = percentProgressSelected * videoRef.current!.duration;

        seekInMedia(newMediaTime);

        handlePlayProgress();
    };

    const restartMedia = () => {
        seekInMedia(0);

        if (mediaState.isPlaying) {
            togglePlay();
        }
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.isMissingAudioLink });
            return;
        }

        if (!videoRef.current) return;

        const videoElement = videoRef.current;

        const onLoadedData = () => {
            console.log('loadeddata');

            if (videoElement.readyState >= 2) {
                setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlay });
            }
        };

        const onCanPlay = () => {
            console.log('canplaythrough');

            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlay });
        };

        const onError = () => {
            console.log('error');

            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.error });
        };

        const onLoadedMetadata = () => {
            console.log('loadedmetadata');

            const videoDuration = videoElement.duration;

            setMediaState({ ...mediaState, duration: videoDuration });
        };

        const onProgress = () => {
            console.log('progress');

            if (!videoElement.buffered) return;

            const bufferedTimeRanges = videoElement.buffered;

            const bufferedTimeRangesLength = bufferedTimeRanges.length;

            const bufferedEnd =
                bufferedTimeRangesLength > 0
                    ? bufferedTimeRanges.end(bufferedTimeRangesLength - 1)
                    : 0;

            const videoDuration = videoElement.duration;

            const updatedBuffer = (bufferedEnd / videoDuration) * 100;

            setMediaState({ ...mediaState, buffer: updatedBuffer });
        };

        videoElement.addEventListener('loadeddata', onLoadedData);

        videoElement.addEventListener('error', onError);

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);

        videoElement.addEventListener('progress', onProgress);
    }, [videoRef.current, mediaState]);

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
                    value={mediaState.progress}
                    valueBuffer={mediaState.buffer}
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
                            <IconButton onClick={restartMedia} disabled={mediaState.progress === 0}>
                                <ReplayIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={mediaState.isPlaying ? 'Pause Media' : 'Play Media'}>
                            <IconButton
                                onClick={togglePlay}
                                disabled={mediaState.loadStatus === VideoVerifiedState.loading}
                            >
                                {mediaState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
                        {mediaState.playWithSubtitles && (
                            <SubtitlesByTime
                                subtitles={subtitles}
                                currentTime={mediaState.currentTime}
                                selectedLanguageCodeForSubtitles={transcriptLanguageCode}
                            />
                        )}
                    </Box>
                    <Box>
                        <FormattedCurrentTime currentTimeInSeconds={mediaState.currentTime} />
                        {` / `}
                        <FormattedCurrentTime currentTimeInSeconds={mediaState.duration} />
                    </Box>
                </VideoControls>
                <Typography component="div" variant="h5">
                    Loading status: {mediaState.loadStatus}
                </Typography>
            </Box>
        </Box>
    );
};
