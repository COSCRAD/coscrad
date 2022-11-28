import {
    EdgeConnectionType,
    IEdgeConnectionContext,
    INoteViewModel,
    ResourceCompositeIdentifier,
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

    const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

    const searchResult = data.filter(
        ({ connectedResources, connectionType }: INoteViewModel) =>
            connectionType === EdgeConnectionType.dual &&
            connectedResources.some(({ compositeIdentifier }) =>
                isTargetCompositeIdentifier(compositeIdentifier)
            )
    );

    return {
        isLoading: false,
        errorInfo: null,
        data: searchResult.map(focusDualConnectionOnResource(compositeIdentifierToMatch)),
    };
};