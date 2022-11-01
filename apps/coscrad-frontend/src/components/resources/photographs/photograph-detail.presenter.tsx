import { IDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const PhotographDetailPresenter = (
    photographAndActions: IDetailQueryResult<IPhotographViewModel>
): JSX.Element => {
    const result = GenericDetailPresenter(photographAndActions);

    return result;
};
