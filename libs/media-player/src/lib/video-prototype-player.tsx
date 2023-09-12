import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
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

    const [transcriptLanguageCode, setTranscriptLanguageCode] = useState<LanguageCode>(
        LanguageCode.English
    );

    const playPauseMedia = () => {
        if (mediaState.loadStatus === VideoVerifiedState.loading) {
            console.log('video not yet loaded');
        }
        if (videoRef.current!.paused) {
            videoRef.current!.play();
        } else {
            videoRef.current!.pause();
        }
        // TODO: use event handler to listen to play state of video ref
        // set event handler on .pause as well
        // TODO: get rid of mediaState.isPlaying?
        // setMediaState({ ...mediaState, isPlaying: !mediaState.isPlaying });
    };

    const handlePlayProgress = () => {
        const currentTime = videoRef.current!.currentTime;

        const duration = videoRef.current!.duration;

        if (currentTime <= 0) return;

        const progress = (currentTime / duration) * 100;

        console.log(`${currentTime} / ${duration} = ${progress}`);

        setMediaState({ ...mediaState, progress: progress, currentTime: currentTime });

        if (!mediaState.shouldPlayWithSubtitles) {
            onTimeUpdate!(currentTime);
        }
    };

    const seekInMedia = (time: number) => {
        videoRef.current!.currentTime = time;

        setMediaState({ ...mediaState, currentTime: videoRef.current!.currentTime });
    };

    const seekInProgressBar = (progressSelected: number) => {
        const newMediaTime = progressSelected * videoRef.current!.duration;

        console.log(`Seek: ${progressSelected} * ${videoRef.current!.duration} = ${newMediaTime}`);

        console.log({ newMediaTime: newMediaTime });

        seekInMedia(newMediaTime);

        handlePlayProgress();
    };

    const restartMedia = () => {
        seekInMedia(0);

        if (mediaState.isPlaying) {
            playPauseMedia();
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

            if (videoElement.readyState >= 3) {
                setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlay });
                videoElement.addEventListener('canplaythrough', onCanPlayThrough);
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

        const onLoadedMetadata = () => {
            const videoDuration = videoElement.duration;
            console.log(`loadedmetadata duration: ${videoDuration}`);

            setMediaState({ ...mediaState, duration: videoDuration });
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

        const onProgress = () => {
            console.log('progress');

            if (!videoElement.buffered) return;

            const bufferedTimeRanges = videoElement.buffered;

            const bufferedTimeRangesLength = bufferedTimeRanges.length;

            console.log({ countBuffer: bufferedTimeRangesLength });

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

        videoElement.addEventListener('progress', onProgress);

        return () => {
            videoElement.removeEventListener('loadeddata', onLoadedData);

            videoElement.removeEventListener('canplaythrough', onCanPlayThrough);

            videoElement.removeEventListener('loadeddata', onLoadedData);

            videoElement.removeEventListener('playing', onPlaying);

            videoElement.removeEventListener('pause', onPause);

            videoElement.removeEventListener('progress', onProgress);
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
            <Box sx={{ mb: 2 }}>
                {/* With the buffer variant you get an annoying blinking dash bar
                    we may want to make our own simpler one. */}
                {/* <LinearProgress
                    variant="buffer"
                    value={mediaState.progress}
                    valueBuffer={mediaState.buffer}
                    sx={{ height: '10px' }}
                    onClick={(event) => {
                        seekInProgressBar(event);
                    }}
                /> */}
                <CoscradLinearProgressBar
                    buffer={mediaState.buffer}
                    progress={mediaState.progress}
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
                                {/* <PlayArrowIcon /> */}
                            </IconButton>
                        </Tooltip>
                        {mediaState.shouldPlayWithSubtitles && (
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
                <Typography component="div" variant="h5">
                    Progress: {mediaState.progress}
                </Typography>
                <Typography component="div" variant="h5">
                    Buffer: {mediaState.buffer}
                </Typography>
            </Box>
        </Box>
    );
};
