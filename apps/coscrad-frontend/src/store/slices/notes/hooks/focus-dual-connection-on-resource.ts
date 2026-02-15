import {
    IEdgeConnectionContext,
    INoteViewModel,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { compositeIdentifierMatches } from './composite-identifiers-match';
import { ConnectedResource } from './use-loadable-connections-to-resource';

// TODO remove this helper and leverage the denormalized connection record on the resource view
export const focusDualConnectionOnResource =
    (compositeIdentifierToMatch: ResourceCompositeIdentifier) =>
    (note: INoteViewModel): ConnectedResource => {
        const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

        const { connectedResources, note: text } = note;

        const relatedResources = Array.from(Object.values(connectedResources));

        // TODO Sorting into a tuple might be more efficient
        const self = relatedResources.find(
            ({
                resource: compositeIdentifier,
            }: {
                resource: ResourceCompositeIdentifier;
                context: IEdgeConnectionContext;
            }) => isTargetCompositeIdentifier(compositeIdentifier)
        );

        const other = relatedResources.find(
            ({
                resource: compositeIdentifier,
            }: {
                resource: ResourceCompositeIdentifier;
                context: IEdgeConnectionContext;
            }) => isTargetCompositeIdentifier(compositeIdentifier)
        );

        return {
            // @ts-expect-error Do we really need to expose the `ResourceType` enum to the client?
            compositeIdentifier: other.resource,
            selfContext: self.context,
            otherContext: other.context,
            text,
        };
    };
