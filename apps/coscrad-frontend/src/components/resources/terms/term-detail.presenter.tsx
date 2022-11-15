import { IDetailQueryResult, ITermViewModel, ResourceType } from '@coscrad/api-interfaces';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources/connected-resources-panel';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

// TODO Bring across the custom component from the `tng-dictionary` project
// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailPresenter = (
    dataAndActions: IDetailQueryResult<ITermViewModel>
): JSX.Element => (
    <div>
        <GenericDetailPresenter {...dataAndActions} />
        <ConnectedResourcesPanel
            compositeIdentifier={{ type: ResourceType.term, id: dataAndActions.data.id }}
        />
    </div>
);
