import { ConnectedResource } from '../../../notes/hooks';

export const ConnectedResourcesPanelPresenter = ({
    selfContext,
    otherContext,
    compositeIdentifier,
}: ConnectedResource): JSX.Element => (
    <div>
        {/* TODO Join in a view of the resource! */}
        connected resource: {JSON.stringify(compositeIdentifier)}
        self context: {JSON.stringify(selfContext)}
        other context: {JSON.stringify(otherContext)}
    </div>
);
