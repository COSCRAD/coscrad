import { IDetailQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const SongDetailPresenter = (
    songAndActions: IDetailQueryResult<ISongViewModel>
): JSX.Element => GenericDetailPresenter(songAndActions);
