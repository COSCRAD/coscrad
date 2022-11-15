import {
    IEdgeConnectionContext,
    IEdgeConnectionMember,
    INoteViewModel,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../interfaces/loadable.interface';
import { useLoadableNotes } from './use-loadable-notes';

export type ConnectedResource = {
    compositeIdentifier: ResourceCompositeIdentifier;
    selfContext: IEdgeConnectionContext;
    otherContext: IEdgeConnectionContext;
};

// TODO Unit test this helper
// Too bad we can't use `isDeepStrictEqual` in the browser...
const compositeIdentifiersMatch = (
    { id, type }: ResourceCompositeIdentifier,
    { id: idToMatch, type: typeToMatch }: ResourceCompositeIdentifier
) => id === idToMatch && type === typeToMatch;

const focusDualConnectionOnResource =
    (compositeIdentifierToMatch: ResourceCompositeIdentifier) =>
    (relatedResources: IEdgeConnectionMember<string, ResourceType>[]): ConnectedResource => {
        // TODO Sorting into a tuple might be more efficient
        const selfContext = relatedResources.find(({ compositeIdentifier }) =>
            compositeIdentifiersMatch(compositeIdentifier, compositeIdentifierToMatch)
        ).context;

        const other = relatedResources.find(
            ({ compositeIdentifier }) =>
                !compositeIdentifiersMatch(compositeIdentifier, compositeIdentifierToMatch)
        );

        return {
            compositeIdentifier: other.compositeIdentifier,
            selfContext,
            otherContext: other.context,
        };
    };

export const useLoadableConnectionsToResource = (
    compositeIdentifierToMatch: ResourceCompositeIdentifier
): ILoadable<ConnectedResource[]> => {
    const loadableNotes = useLoadableNotes();

    const { data, errorInfo, isLoading } = loadableNotes;

    if (isLoading || errorInfo !== null || data === null)
        return {
            isLoading,
            errorInfo,
            data: null,
        };

    // TODO can we call the view model prop connected resources?
    const searchResult =
        data.filter(
            ({ relatedResources }: INoteViewModel) =>
                relatedResources.length === 2 &&
                relatedResources.some(({ compositeIdentifier }) =>
                    compositeIdentifiersMatch(
                        compositeIdentifier as ResourceCompositeIdentifier,
                        compositeIdentifierToMatch
                    )
                )
        ) || [];

    return {
        isLoading: false,
        errorInfo: null,
        // @ts-expect-error TODO fix me
        data: searchResult.map(focusDualConnectionOnResource(compositeIdentifierToMatch)),
    };
};
