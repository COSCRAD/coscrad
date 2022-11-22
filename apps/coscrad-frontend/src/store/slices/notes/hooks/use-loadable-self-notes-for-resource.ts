import {
    IEdgeConnectionContext,
    INoteViewModel,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../interfaces/loadable.interface';
import { compositeIdentifierMatches } from './composite-identifiers-match';
import { useLoadableNotes } from './use-loadable-notes';

export type SelfConnectionNote = {
    id: string;
    text: string;
    context: IEdgeConnectionContext;
};

/**
 * In the sake of code reuse, we may want to combine this helper
 * with `useLoadableConnectionsToResource`. You'd pass in
 * - a filter callback
 * - a map callback that converts an `INoteViewModel` to the data type you need (SelfConnectionNotes here)
 */
export const useLoadableSelfNotesForResource = (
    compositeIdentifierToMatch: ResourceCompositeIdentifier
): ILoadable<SelfConnectionNote[]> => {
    const loadableNotes = useLoadableNotes();

    const { data, errorInfo, isLoading } = loadableNotes;

    if (errorInfo !== null)
        return {
            isLoading: false,
            errorInfo,
            data: null,
        };

    if (isLoading || data === null)
        return {
            isLoading,
            errorInfo,
            data: null,
        };

    // The following helper is curried
    const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

    const selfNotesForThisResource = data
        .filter(
            ({ relatedResources }: INoteViewModel) =>
                relatedResources.length === 1 &&
                isTargetCompositeIdentifier(relatedResources[0].compositeIdentifier)
        )
        .map(({ id, note, relatedResources }) => ({
            id,
            /**
             * `note.note` would be confusing. Note that we are aliasing in our
             * view layer to translate our domain model (Edge Connections) to
             * more user specific form. It could be that we've missed an important
             * bit of DDD in our modelling. For now, it's easiest to make the shift
             * here. We could propogate back to the view model or even domain model
             * layer.
             */
            text: note,
            context: relatedResources[0].context,
        }));

    return {
        isLoading: false,
        errorInfo: null,
        data: selfNotesForThisResource,
    };
};
