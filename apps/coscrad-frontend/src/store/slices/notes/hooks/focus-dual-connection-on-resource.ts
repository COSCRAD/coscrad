import { INoteViewModel, ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { compositeIdentifierMatches } from './composite-identifiers-match';
import { ConnectedResource } from './use-loadable-connections-to-resource';

export const focusDualConnectionOnResource =
    (compositeIdentifierToMatch: ResourceCompositeIdentifier) =>
    (note: INoteViewModel): ConnectedResource => {
        const isTargetCompositeIdentifier = compositeIdentifierMatches(compositeIdentifierToMatch);

        const { connectedResources: relatedResources, note: text } = note;

        // TODO Sorting into a tuple might be more efficient
        const selfContext = relatedResources.find(({ compositeIdentifier }) =>
            isTargetCompositeIdentifier(compositeIdentifier)
        ).context;

        const other = relatedResources.find(
            ({ compositeIdentifier }) => !isTargetCompositeIdentifier(compositeIdentifier)
        );

        return {
            compositeIdentifier: other.compositeIdentifier,
            selfContext,
            otherContext: other.context,
            text,
        };
    };
