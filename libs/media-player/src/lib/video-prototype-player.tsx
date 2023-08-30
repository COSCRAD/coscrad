import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    Replay as ReplayIcon,
} from '@mui/icons-material/';
import { Box, IconButton, LinearProgress, Tooltip, styled } from '@mui/material';
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

        onTimeUpdateHandler!(currentTime);
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

        const onCanPlay = () => {
            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.canPlay });
        };

        const onError = () => {
            setMediaState({ ...mediaState, loadStatus: VideoVerifiedState.error });
        };

        /**
         * This video instance will never be played. We are using it to test whether
         * the URL is valid.
         */
        const testVideo = document.createElement('video');

        testVideo.src = videoUrl;

        testVideo.addEventListener('canplaythrough', onCanPlay);

        testVideo.addEventListener('error', onError);

        videoRef.current!.addEventListener('loadedmetadata', () => {
            const videoDuration = videoRef.current!.duration;

            setMediaState({ ...mediaState, duration: videoDuration });
        });

        videoRef.current!.addEventListener('progress', () => {
            const bufferedTimeRanges = videoRef.current!.buffered;

            const bufferedTimeRangesLength = bufferedTimeRanges.length;

            const bufferedEnd =
                bufferedTimeRangesLength > 0
                    ? bufferedTimeRanges.end(bufferedTimeRangesLength - 1)
                    : 0;

            const videoDuration = videoRef.current!.duration;

            const updatedBuffer = (bufferedEnd / videoDuration) * 100;

            setMediaState({ ...mediaState, buffer: updatedBuffer });
        });
    }, [videoRef, mediaState]);

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
                            <IconButton onClick={togglePlay}>
                                {mediaState.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Tooltip>
                        <SubtitlesByTime
                            subtitles={subtitles}
                            currentTime={mediaState.currentTime}
                            selectedLanguageCodeForSubtitles={transcriptLanguageCode}
                        />
                    </Box>
                    <Box>
                        <FormattedCurrentTime currentTimeInSeconds={mediaState.currentTime} />
                        {` / `}
                        <FormattedCurrentTime currentTimeInSeconds={mediaState.duration} />
                    </Box>
                </VideoControls>
            </Box>
        </Box>
    );
};
