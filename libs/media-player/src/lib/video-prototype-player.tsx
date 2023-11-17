import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
    Expand as ExpandMoreIcon,
    FullscreenExit as FullscreenExitIcon,
    Fullscreen as FullscreenIcon,
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material/';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    IconButton,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { CoscradMediaEditor } from './coscrad-media-editor';
import { FormattedCurrentTime } from './formatted-currenttime';
import { LanguageCode } from './language-code.enum';
import { ITranscript } from './video-prototype-interfaces/transcript-interface';

const calculatePercentProgress = (currentTime: number, duration: number) => {
    return (currentTime / duration) * 100;
};

const getUpdatedBuffer = (videoTarget: HTMLVideoElement) => {
    const { buffered: bufferedTimeRanges, duration } = videoTarget;

    const bufferedTimeRangesLength = bufferedTimeRanges.length;

    const bufferedEnd =
        bufferedTimeRangesLength > 0 ? bufferedTimeRanges.end(bufferedTimeRangesLength - 1) : 0;

    const updatedBuffer = (bufferedEnd / duration) * 100;

    return updatedBuffer;
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
    playProgress: number;
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
    transcript: ITranscript;
    onTimeUpdate?: (currentTime: number) => void;
}

export const VideoPrototypePlayer = ({
    videoUrl,
    transcript,
    onTimeUpdate,
}: VideoPrototypePlayerProps): JSX.Element => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const fullscreenRef = useRef<HTMLDivElement>(null);

    const [mediaState, setMediaState] = useState<MediaState>({
        loadStatus: VideoVerifiedState.loading,
        duration: 0,
        buffer: 0,
        isPlaying: false,
        currentTime: 0,
        playProgress: 0,
        shouldPlayWithSubtitles: isNullOrUndefined(onTimeUpdate) ? true : false,
    });

    const [inPointMilliseconds, setInPointMilliseconds] = useState<number | null>(null);

    const [outPointMilliseconds, setOutPointMilliseconds] = useState<number | null>(null);

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

    const onLoadedData = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
        /**
         * The problem of not accessing the video duration must have to do with
         * react rendering because the duration is always logged to the console, but
         * this MDN article also refers to some sketchiness:
         * https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/cross_browser_video_player#progress
         * "Unfortunately in some mobile browsers, when loadedmetadata is raised —
         * if it even is raised — video.duration may not have the correct value,
         * or even any value at all. So something else needs to be done. More on
         * that below."
         *
         * This is only in reference to `loadedmetadata` on mobile, but perhaps
         * there are other impacts.
         */

        const videoTarget = event.target as HTMLVideoElement;

        const { readyState, duration } = videoTarget;

        setMediaState(() => ({
            ...mediaState,
            loadStatus: VideoVerifiedState.canPlay,
            duration: duration,
        }));
    };

    const onCanPlayThrough = () => {
        console.log('canplaythrough');

        if (mediaState.duration === 0) {
            const videoTarget = videoRef.current!;

            const { duration } = videoTarget;

            setMediaState({
                ...mediaState,
                loadStatus: VideoVerifiedState.canPlayThrough,
                duration: duration,
            });
        } else {
            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlayThrough });
        }
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

    const onProgressBuffer = (event: SyntheticEvent<HTMLVideoElement, Event>) => {
        console.log('progress buffer');

        if (mediaState.currentTime > 0) return;

        const videoTarget = event.target as HTMLVideoElement;

        const updatedBuffer = getUpdatedBuffer(videoTarget);

        // const { buffered: bufferedTimeRanges, duration } = videoTarget;

        // const bufferedTimeRangesLength = bufferedTimeRanges.length;

        // const bufferedEnd =
        //     bufferedTimeRangesLength > 0 ? bufferedTimeRanges.end(bufferedTimeRangesLength - 1) : 0;

        // const updatedBuffer = (bufferedEnd / duration) * 100;

        setMediaState({ ...mediaState, buffer: updatedBuffer });
    };

    const playPauseMedia = () => {
        if (mediaState.loadStatus === VideoVerifiedState.loading) {
            console.log('video not yet loaded');
        }

        if (!videoRef.current) return;

        const videoElement = videoRef.current;

        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    };

    const handlePlayProgress = () => {
        const videoTarget = videoRef.current!;

        const { currentTime, duration } = videoTarget;

        const playProgress = calculatePercentProgress(currentTime, duration);

        const updatedBuffer = getUpdatedBuffer(videoTarget);

        setMediaState({
            ...mediaState,
            playProgress: playProgress,
            currentTime: currentTime,
            buffer: updatedBuffer,
        });

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
            playProgress: progress,
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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            fullscreenRef.current!.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };

    const onFullScreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
    };

    useEffect(() => {
        document.addEventListener('fullscreenchange', onFullScreenChange);

        return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
    });

    return (
        <div ref={fullscreenRef}>
            <Box>
                <Video
                    ref={videoRef}
                    sx={{
                        width: `${isFullscreen ? '50%' : '100%'}`,
                    }}
                    onTimeUpdate={handlePlayProgress}
                    onClick={playPauseMedia}
                    onError={onError}
                    onLoadedData={onLoadedData}
                    onCanPlayThrough={onCanPlayThrough}
                    onPlaying={onPlaying}
                    onPause={onPause}
                    onProgress={onProgressBuffer}
                    disablePictureInPicture
                    muted
                >
                    <source src={videoUrl} />
                </Video>
                {/* <SubtitlesOverlay>
                {mediaState.shouldPlayWithSubtitles ? (
                    <SubtitlesByTime
                        subtitles={subtitles}
                        currentTime={mediaState.currentTime}
                        selectedLanguageCodeForSubtitles={transcriptLanguageCode}
                    />
                ) : null}
            </SubtitlesOverlay> */}

                <Box sx={{ mb: 2, position: 'relative' }}>
                    {/* <CoscradLinearProgressBar
                    buffer={mediaState.buffer}
                    progress={mediaState.progress}
                    inPointMilliseconds={inPointMilliseconds}
                    outPointMilliseconds={outPointMilliseconds}
                    mediaDuration={mediaState.duration}
                    seekInProgressBar={seekInProgressBar}
                /> */}
                    <CoscradMediaEditor
                        buffer={mediaState.buffer}
                        playProgress={mediaState.playProgress}
                        inPointMilliseconds={inPointMilliseconds}
                        outPointMilliseconds={outPointMilliseconds}
                        mediaDuration={mediaState.duration}
                        seekInProgressBar={seekInProgressBar}
                        transcript={transcript}
                    />
                    <VideoControls>
                        <Box>
                            {/* Note: the tooltip on the disabled button generates an error.  There's a 
                            discussion (https://github.com/mui/material-ui/issues/8416) that still seems
                            to be unresolved.  This: https://github.com/mui/material-ui/issues/8416#issuecomment-1294989582
                            seems correct for UI design, that tooltips should appear regardless of a button's disabled status 
                        */}
                            <Tooltip title="Restart Media">
                                <IconButton
                                    onClick={restartMedia}
                                    disabled={mediaState.playProgress === 0}
                                >
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
                            <Tooltip title="Toggle Full Screen">
                                <IconButton onClick={toggleFullscreen}>
                                    {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box>
                            <FormattedCurrentTime currentTimeInSeconds={mediaState.currentTime} />
                            {` / `}
                            <FormattedCurrentTime currentTimeInSeconds={mediaState.duration} />
                        </Box>
                    </VideoControls>
                    <Accordion>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                        >
                            <Typography>Debug</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography component="div" variant="h5">
                                Full Screen: {JSON.stringify(isFullscreen)}
                            </Typography>
                            <Typography component="div" variant="h5">
                                Loading status: {mediaState.loadStatus}
                            </Typography>
                            <Typography component="div" variant="h5">
                                Playhead: {mediaState.currentTime}
                            </Typography>
                            <Typography component="div" variant="h5">
                                Progress: {mediaState.playProgress}
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
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Box>
        </div>
    );
};
