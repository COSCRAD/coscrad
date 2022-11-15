import {
    IEdgeConnectionContext,
    IEdgeConnectionMember,
    INoteViewModel,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../interfaces/loadable.interface';
import { compositeIdentifierMatches } from './composite-identifiers-match';
import { focusDualConnectionOnResource } from './focus-dual-connection-on-resource';
import { useLoadableNotes } from './use-loadable-notes';

export type ConnectedResource = {
    compositeIdentifier: ResourceCompositeIdentifier;
    selfContext: IEdgeConnectionContext;
    otherContext: IEdgeConnectionContext;
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

    const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

    // TODO can we call the view model prop connected resources?
    const searchResult =
        data.filter(
            ({ relatedResources }: INoteViewModel) =>
                relatedResources.length === 2 &&
                (relatedResources as IEdgeConnectionMember<string, ResourceType>[]).some(
                    ({ compositeIdentifier }) => isTargetCompositeIdentifier(compositeIdentifier)
                )
        ) || [];

    return {
        isLoading: false,
        errorInfo: null,
        data: searchResult.map(focusDualConnectionOnResource(compositeIdentifierToMatch)),
    };
};
