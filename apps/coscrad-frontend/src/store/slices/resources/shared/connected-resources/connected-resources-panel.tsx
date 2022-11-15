import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../../../../components/higher-order-components';
import { useLoadableConnectionsToResource } from '../../../notes/hooks';
import { ConnectedResourcesPanelPresenter } from './connected-resources-panel.presenter';

export const ConnectedResourcesPanel = (
    compositeIdentifier: ResourceCompositeIdentifier
): JSX.Element => {
    const loadable = useLoadableConnectionsToResource(compositeIdentifier);

    const Presenter = displayLoadableWithErrorsAndLoading(ConnectedResourcesPanelPresenter);

    return <Presenter {...loadable} />;
};
