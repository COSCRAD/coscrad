import { createContext, FC as FunctionalComponent, ReactNode, useState } from 'react';

export type MediaCurrentTimeFromContext = number;

export type MediaCurrentTimeContext = {
    mediaCurrentTimeFromContext: MediaCurrentTimeFromContext;
    setMediaCurrentTimeFromContext: (
        mediaCurrentTimeFromContext: MediaCurrentTimeFromContext
    ) => void;
};

export const MediaCurrentTimeContext = createContext<MediaCurrentTimeContext | null>(null);

type MediaCurrentTimeProviderProps = {
    children: ReactNode;
};

export const MediaCurrentTimeProvider: FunctionalComponent<MediaCurrentTimeProviderProps> = ({
    children,
}: MediaCurrentTimeProviderProps) => {
    const [mediaCurrentTimeFromContext, setMediaCurrentTimeFromContext] =
        useState<MediaCurrentTimeFromContext>(null);

    return (
        <MediaCurrentTimeContext.Provider
            value={{ mediaCurrentTimeFromContext, setMediaCurrentTimeFromContext }}
        >
            {children}
        </MediaCurrentTimeContext.Provider>
    );
};
