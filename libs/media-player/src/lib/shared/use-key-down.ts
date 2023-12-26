import { useCallback, useEffect } from 'react';
import { KeyboardShortcuts } from '../audio-annotator';

const isKeyBoardShortcut = (
    keyInput: unknown,
    keys: KeyboardShortcuts[]
): keyInput is KeyboardShortcuts => keys.includes(keyInput as KeyboardShortcuts);

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
            if (
                event.target &&
                (event.target instanceof HTMLTextAreaElement ||
                    (event.target instanceof HTMLInputElement &&
                        (!event.target.type || event.target.type === 'text')))
            )
                return;

            const keyInput = isKeyBoardShortcut(event.key, keys);

            if (keyInput) {
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
