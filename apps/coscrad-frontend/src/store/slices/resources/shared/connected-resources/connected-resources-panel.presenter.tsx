import { ConnectedResource } from '../../../notes/hooks';
import { ResourceDetailThumbnail } from './resource-detail-thumbnail';

interface Props {
    data: ConnectedResource[];
}

export const ConnectedResourcesPanelPresenter = ({
    data: connectedResources,
}: Props): JSX.Element => (
    <div data-testid={'connectedResourcesPanel'}>
        <h2>Connected Resources</h2>
        {connectedResources.map(({ compositeIdentifier, selfContext, otherContext }) => (
            <div key={`${compositeIdentifier.type}/${compositeIdentifier.id}`}>
                <ResourceDetailThumbnail {...compositeIdentifier} />
                self context: {JSON.stringify(selfContext)}
                other context: {JSON.stringify(otherContext)}
            </div>
        ))}
    </div>
);
