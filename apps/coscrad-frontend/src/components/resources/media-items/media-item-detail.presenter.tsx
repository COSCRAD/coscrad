import { IDetailQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const MediaItemDetailPresenter = (
    mediaItemAndActions: IDetailQueryResult<IMediaItemViewModel>
): JSX.Element => GenericDetailPresenter(mediaItemAndActions);
