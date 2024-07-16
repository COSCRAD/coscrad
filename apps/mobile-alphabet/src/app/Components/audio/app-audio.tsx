import { useEffect, useState } from 'react';
import { Button, Text } from 'react-native';
import Sound from 'react-native-sound';

interface AppAudioProps {
    url: string;
    message: string;
}

enum LoadingState {
    idle = 'idle',
    pending = 'pending',
    success = 'success',
    error = 'error',
}

export const AppAudio = ({ url, message }: AppAudioProps) => {
    const [loadingState, setLoadingState] = useState(LoadingState.idle);

    const [sound, setSound] = useState<Sound | null>(null);

    useEffect(() => {
        if (loadingState === LoadingState.idle) {
            setSound(
                new Sound(url, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                        setLoadingState(LoadingState.error);
                    } else {
                        setLoadingState(LoadingState.success);
                    }
                })
            );
        }
    }, [loadingState, url]);

    useEffect(() => {
        setLoadingState(LoadingState.idle);
    }, [url]);

    const playAudio = () => {
        sound.play((didSucceed) => {
            if (!didSucceed) {
                setLoadingState(LoadingState.error);
            }

            // Note that the state must already be success to hit this point
        });
    };
    return loadingState === LoadingState.success ? (
        <Button
            testID={'appAudioPlayer'}
            title={message}
            onPress={playAudio}
            disabled={loadingState !== LoadingState.success}
        />
    ) : (
        <Text testID={'audioError'}>Error loading {message} audio</Text>
    );
};
