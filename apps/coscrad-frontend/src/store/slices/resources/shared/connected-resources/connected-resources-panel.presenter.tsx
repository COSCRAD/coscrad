import { ConnectedResource } from '../../../notes/hooks';

interface Props {
    data: ConnectedResource[];
}

export const ConnectedResourcesPanelPresenter = ({
    data: connectedResources,
}: Props): JSX.Element => (
    <div>
        {connectedResources.map(({ compositeIdentifier, selfContext, otherContext }) => (
            <div key={compositeIdentifier.id}>
                {/* TODO Join in a view of the resource! */}
                connected resource: {JSON.stringify(compositeIdentifier)}
                self context: {JSON.stringify(selfContext)}
                other context: {JSON.stringify(otherContext)}
            </div>
        ))}
    </div>
);
