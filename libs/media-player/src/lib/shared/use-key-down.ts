import { useCallback, useEffect } from 'react';
import { KeyboardShortcuts } from '../audio-annotator';

export enum KeyboardKey {
    escape = 'Escape',
    enter = 'Enter',
    spacebar = ' ',
    i = 'i',
    o = 'o',
    c = 'c',
    j = 'j',
    k = 'k',
}

export const useKeyDown = (callback: () => void, keys: KeyboardShortcuts[]) => {
    const onKeyDown = useCallback(
        (event: KeyboardEvent) => {
            const wasAnyKeyPressed = keys.some((key) => event.key === key);

            if (wasAnyKeyPressed) {
                event.preventDefault();

                callback();
            }
        },
        [callback, keys]
    );

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [onKeyDown]);
};
