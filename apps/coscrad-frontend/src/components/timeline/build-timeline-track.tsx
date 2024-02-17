import { ITimeRangeContext } from '@coscrad/api-interfaces';
import { findOriginalTextItem } from '../notes/shared/find-original-text-item';
import { buildTimeRangeClip } from './timeline-label';

export const buildTimelineTrack = (trackLabel, timeAlignedData, audioRef) => {
    return timeAlignedData.flatMap(({ connectedResources, note, id: noteId }) => {
        const timeRangeContext = connectedResources[0].context as ITimeRangeContext;

        const {
            timeRange: { inPointMilliseconds, outPointMilliseconds },
        } = timeRangeContext;

        const noteOriginal = findOriginalTextItem(note).text;

        const tipText = `[${inPointMilliseconds} ms to ${outPointMilliseconds}] ${noteOriginal}`;

        /**
         * Should we break this logic out so we can share it for
         * video annotation?
         */
        return [
            buildTimeRangeClip({
                name: `${noteId}`,
                noteText: noteOriginal,
                tip: tipText,
                inPointMilliseconds: inPointMilliseconds,
                outPointMilliseconds: outPointMilliseconds,
                onClick: (inPointSeconds) => {
                    audioRef.current.currentTime = inPointSeconds;
                },
            }),
        ];
    });
};
