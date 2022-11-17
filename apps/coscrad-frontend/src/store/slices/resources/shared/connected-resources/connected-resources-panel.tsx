import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { ErrorDisplay } from '../../../../../components/ErrorDisplay/ErrorDisplay';
import { Loading } from '../../../../../components/Loading';
import { useLoadableConnectionsToResource } from '../../../notes/hooks';
import { ConnectedResourcesPanelPresenter } from './connected-resources-panel.presenter';

export interface ConnectedResourcesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const ConnectedResourcesPanel = ({
    compositeIdentifier,
}: ConnectedResourcesPanelProps): JSX.Element => {
    const {
        isLoading,
        errorInfo,
        data: connections,
    } = useLoadableConnectionsToResource(compositeIdentifier);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || connections === null) return <Loading />;

    return <ConnectedResourcesPanelPresenter data={connections} />;
};
