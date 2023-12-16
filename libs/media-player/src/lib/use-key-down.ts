import { useCallback, useEffect } from 'react';

export enum KeyboardKey {
    escape = 'Escape',
    enter = 'Enter',
    inpoint = 'i',
    outpoint = 'o',
    clear = 'c',
    spacebar = ' ',
    reverse = 'j',
    forward = 'k',
}

export const useKeyDown = (callback: () => void, keys: KeyboardKey[]) => {
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
