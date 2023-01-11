import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../../../../components/higher-order-components';
import { wrapArrayProps } from '../../../../../utils/prop-manipulation/wrap-array-props';
import { useLoadableConnectionsToResource } from '../../../notes/hooks';
import { CategorizablesOfManyTypesPanelPresenter } from './connected-resources-panel.presenter';

export interface ConnectedResourcesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const ConnectedResourcesPanel = ({
    compositeIdentifier,
}: ConnectedResourcesPanelProps): JSX.Element => {
    const loadableConnections = useLoadableConnectionsToResource(compositeIdentifier);

    const Presenter = displayLoadableWithErrorsAndLoading(
        CategorizablesOfManyTypesPanelPresenter,
        wrapArrayProps
    );

    return <Presenter {...loadableConnections} />;
};
