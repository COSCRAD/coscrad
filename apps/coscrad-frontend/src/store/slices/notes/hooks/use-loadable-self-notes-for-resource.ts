import {
    EdgeConnectionType,
    IEdgeConnectionContext,
    INoteViewModel,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { findOriginalTextItem } from '../../../../components/notes/shared/find-original-text-item';
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

    if (isLoading || isNull(data))
        return {
            isLoading,
            errorInfo,
            data: null,
        };

    // The following helper is curried
    const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

    const selfNotesForThisResource = data.entities
        .filter(
            ({ connectedResources: relatedResources, connectionType }: INoteViewModel) =>
                connectionType === EdgeConnectionType.self &&
                isTargetCompositeIdentifier(relatedResources[0].compositeIdentifier)
        )
        .map(({ id, note, connectedResources: relatedResources }) => ({
            id,
            /**
             * `note.note` would be confusing. Note that we are aliasing in our
             * view layer to translate our domain model (Edge Connections) to
             * more user specific form. It could be that we've missed an important
             * bit of DDD in our modelling. For now, it's easiest to make the shift
             * here. We could propogate back to the view model or even domain model
             * layer.
             *
             * We are mimicking the legacy behaviour of having text in a single
             * language to sidestep the UX complexity. Invariant rules guarantee
             * that there will always be an original text item. In the future,
             * we can localize notes using language codes and provide a rich
             * multilingual experience.
             */
            text: findOriginalTextItem(note).text,
            context: relatedResources[0].context,
        }));

    return {
        isLoading: false,
        errorInfo: null,
        data: selfNotesForThisResource,
    };
};
