import {
    AggregateType,
    EdgeConnectionType,
    IMediaAnnotation,
    IMediaSegmentLabel,
} from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { TimeRangeContext } from '../../models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';

export const buildAnnotationsFromSnapshot = (state: DeluxeInMemoryStore): IMediaAnnotation[] => {
    const allAudioItems = state.fetchAllOfType(AggregateType.audioItem);

    const allVideos = state.fetchAllOfType(AggregateType.video);

    const allNotes = state.fetchAllOfType(AggregateType.note);

    const selfNotesForAudiovisualItems = allNotes.filter(validAggregateOrThrow).filter(
        ({ connectionType, members }) =>
            connectionType === EdgeConnectionType.self &&
            [AggregateType.audioItem, AggregateType.video].includes(
                members[0].compositeIdentifier.type
            ) &&
            // only a self-note with a time range context constitutes an annotation
            members[0].context.type === EdgeConnectionContextType.timeRange
    );

    return [...allAudioItems, ...allVideos].map((item): IMediaAnnotation => {
        const compositeIdentifier = item.getCompositeIdentifier();

        const relevantNotes = selfNotesForAudiovisualItems.filter(({ members }) =>
            isDeepStrictEqual(item.getCompositeIdentifier(), members[0].compositeIdentifier)
        );

        const labels: IMediaSegmentLabel[] = relevantNotes.map(({ members, note }) => {
            // we have filtered for this above
            const {
                timeRange: { inPointMilliseconds, outPointMilliseconds },
            } = members[0].context as TimeRangeContext;

            const MILLISECONDS_PER_SECOND = 1000;

            return {
                // TODO Use math lib
                inPointSeconds: inPointMilliseconds / MILLISECONDS_PER_SECOND,
                outPointSeconds: outPointMilliseconds / MILLISECONDS_PER_SECOND,
                name: `TODO Generate sequence number- {aggregateType}-{mediaItemId}-{timeOrderedSequenceNumber}`,
                note,
                // TODO Join in tags
                tags: [],
            };
        });

        return {
            aggregateCompositeIdentifier: compositeIdentifier,
            labels,
        };
    });
};
