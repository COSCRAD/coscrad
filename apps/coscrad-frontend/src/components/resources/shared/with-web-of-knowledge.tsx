import {
    IBaseViewModel,
    IDetailQueryResult,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesPanelContainer } from '../../../store/slices/resources/shared/notes-for-resource';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export const WithWebOfKnowledge =
    (
        DetailPresenter: FunctionalComponent<IDetailQueryResult<IBaseViewModel>>,
        compositeIdentifier: ResourceCompositeIdentifier
    ) =>
    (props: IDetailQueryResult<IBaseViewModel>) =>
        (
            <div>
                {DetailPresenter(props as unknown as T)}
                {/* TODO Only expose commands if you have an admin user context */}
                {/* <CommandPanel actions={props.actions} /> */}
                <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
                <SelfNotesPanelContainer compositeIdentifier={compositeIdentifier} />
            </div>
        );
