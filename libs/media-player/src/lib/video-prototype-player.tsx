import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Tooltip, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { CoscradLinearProgressBar } from './coscrad-linear-progress-bar';
import { FormattedCurrentTime } from './formatted-currenttime';
import { LanguageCode } from './language-code.enum';
import { SubtitlesByTime } from './subtitles-by-time';

const calculatePercentProgress = (currentTime: number, duration: number) => {
    return (currentTime / duration) * 100;
};

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

const SubtitlesOverlay = styled('div')({
    top: '-50px',
    left: '12%',
    position: 'relative',
    zIndex: 600,
});

enum VideoVerifiedState {
    loading = 'loading',
    error = 'error',
    canPlay = 'canPlay',
    canPlayThrough = 'canPlayThrough',
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
    // TODO: Does this belong here?
    shouldPlayWithSubtitles: boolean;
};

type MultiLingualTextItem = {
    languageCode: LanguageCode;
    text: string;
};

/**
 * TODO: pass in a callback that takes in the current time and
 * returns a react component to overlay on the video component
 */
export type Subtitle = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    textVersions: MultiLingualTextItem[];
    speakerInitials: string;
};

interface VideoPrototypePlayerProps {
    videoUrl: string;
    subtitles: Subtitle[];
    onTimeUpdate?: (currentTime: number) => void;
}

export const VideoPrototypePlayer = ({
    videoUrl,
    subtitles,
    onTimeUpdate,
}: VideoPrototypePlayerProps): JSX.Element => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const [mediaState, setMediaState] = useState<MediaState>({
        loadStatus: VideoVerifiedState.loading,
        duration: 0,
        buffer: 0,
        isPlaying: false,
        currentTime: 0,
        progress: 0,
        shouldPlayWithSubtitles: isNullOrUndefined(onTimeUpdate) ? true : false,
    });

    const [inPointMilliseconds, setInPointMilliseconds] = useState<number | null>(null);

    const [outPointMilliseconds, setOutPointMilliseconds] = useState<number | null>(null);

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const playPauseMedia = () => {
        if (mediaState.loadStatus === VideoVerifiedState.loading) {
            console.log('video not yet loaded');
        }

        if (!videoRef.current) return;

        const videoElement = videoRef.current;

        if (mediaState.duration <= 0 && videoElement.duration > 0) {
            setMediaState({ ...mediaState, duration: videoElement.duration });
        }

        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    };

    const handlePlayProgress = () => {
        const currentTime = videoRef.current!.currentTime;

        const duration = videoRef.current!.duration;

        const progress = calculatePercentProgress(currentTime, duration);

        setMediaState({ ...mediaState, progress: progress, currentTime: currentTime });

        if (!mediaState.shouldPlayWithSubtitles) {
            onTimeUpdate!(currentTime);
        }
    };

    const seekInMedia = (time: number) => {
        console.log(`seekInMedia`);

        videoRef.current!.currentTime = time;

        const progress = calculatePercentProgress(
            videoRef.current!.currentTime,
            videoRef.current!.duration
        );

        setMediaState({
            ...mediaState,
            progress: progress,
            currentTime: videoRef.current!.currentTime,
        });
    };

    const seekInProgressBar = (progressSelected: number) => {
        const newMediaTime = progressSelected * videoRef.current!.duration;

        seekInMedia(newMediaTime);
    };

    const restartMedia = () => {
        seekInMedia(0);

        if (mediaState.isPlaying) {
            playPauseMedia();
        }
    };

    const markInPoint = () => {
        setInPointMilliseconds(videoRef.current!.currentTime);
    };

    const markOutPoint = () => {
        setOutPointMilliseconds(videoRef.current!.currentTime);
    };

    const clearMarkers = () => {
        setInPointMilliseconds(null);
        setOutPointMilliseconds(null);
    };

    useEffect(() => {
        if (isNullOrUndefined(videoUrl)) {
            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.isMissingAudioLink });
            return;
        }

        if (!videoRef.current) return;

        const videoElement = videoRef.current;

        const onLoadedData = () => {
            console.log(`loadeddata: ready: ${videoElement.readyState}`);

            if (videoElement.readyState >= 2) {
                setMediaState({
                    ...mediaState,
                    loadStatus: VideoVerifiedState.canPlay,
                    duration: videoElement.duration,
                });

                videoElement.addEventListener('canplaythrough', onCanPlayThrough);
            }
        };

        const onLoadedMetadata = () => {
            console.log(`onLoadedMetadata duration: ${videoElement.duration}`);

            if (videoElement.duration > 0) {
                setMediaState({
                    ...mediaState,
                    duration: videoElement.duration,
                });
            }
        };

        const onCanPlayThrough = () => {
            console.log('canplaythrough');

            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlayThrough });
        };

        const onError = () => {
            console.log('error');

            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.error });
        };

        const onPlaying = () => {
            console.log('onPlaying');
            if (!mediaState.isPlaying) {
                setMediaState({ ...mediaState, isPlaying: true });
            }
        };

        const onPause = () => {
            console.log('onPause');
            if (mediaState.isPlaying) {
                setMediaState({ ...mediaState, isPlaying: false });
            }
        };

        const onProgressBuffer = () => {
            console.log('progress buffer');

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

        videoElement.addEventListener('error', onError);

        videoElement.addEventListener('loadeddata', onLoadedData);

        videoElement.addEventListener('loadedmetadata', onLoadedMetadata);

        videoElement.addEventListener('playing', onPlaying);

        videoElement.addEventListener('pause', onPause);

        videoElement.addEventListener('progress', onProgressBuffer);

        return () => {
            videoElement.removeEventListener('loadeddata', onLoadedData);

            videoElement.removeEventListener('loadedmetadata', onLoadedMetadata);

            videoElement.removeEventListener('canplaythrough', onCanPlayThrough);

            videoElement.removeEventListener('playing', onPlaying);

            videoElement.removeEventListener('pause', onPause);

            videoElement.removeEventListener('progress', onProgressBuffer);
        };
    }, [videoRef.current, mediaState]);

    return (
        <Box>
            <Video
                ref={videoRef}
                onTimeUpdate={handlePlayProgress}
                onClick={playPauseMedia}
                width="100%"
                disablePictureInPicture
            >
                <source src={videoUrl} />
            </Video>
            <SubtitlesOverlay>
                {mediaState.shouldPlayWithSubtitles ? (
                    <SubtitlesByTime
                        subtitles={subtitles}
                        currentTime={mediaState.currentTime}
                        selectedLanguageCodeForSubtitles={transcriptLanguageCode}
                    />
                ) : null}
            </SubtitlesOverlay>

            <Box sx={{ mb: 2, top: '-25px', position: 'relative' }}>
                <CoscradLinearProgressBar
                    buffer={mediaState.buffer}
                    progress={mediaState.progress}
                    inPointMilliseconds={inPointMilliseconds}
                    outPointMilliseconds={outPointMilliseconds}
                    mediaDuration={mediaState.duration}
                    seekInProgressBar={seekInProgressBar}
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
                        <Tooltip title="Play / Pause Media">
                            <IconButton
                                onClick={playPauseMedia}
                                disabled={mediaState.loadStatus === VideoVerifiedState.loading}
                            >
                                {mediaState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark In Point">
                            <IconButton
                                onClick={markInPoint}
                                disabled={mediaState.loadStatus === VideoVerifiedState.loading}
                            >
                                <ArrowRightIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Mark Out Point">
                            <IconButton
                                onClick={markOutPoint}
                                disabled={mediaState.loadStatus === VideoVerifiedState.loading}
                            >
                                <ArrowLeftIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear Markers">
                            <IconButton
                                onClick={clearMarkers}
                                disabled={
                                    mediaState.loadStatus === VideoVerifiedState.loading ||
                                    isNullOrUndefined(inPointMilliseconds)
                                }
                            >
                                <ClearIcon />
                            </IconButton>
                        </Tooltip>
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
                <Typography component="div" variant="h5">
                    Progress: {mediaState.progress}
                </Typography>
                <Typography component="div" variant="h5">
                    Buffer: {mediaState.buffer}
                </Typography>
                <Typography component="div" variant="h5">
                    In Point: {inPointMilliseconds}
                </Typography>
                <Typography component="div" variant="h5">
                    Out Point: {outPointMilliseconds}
                </Typography>
            </Box>
        </Box>
    );
};
