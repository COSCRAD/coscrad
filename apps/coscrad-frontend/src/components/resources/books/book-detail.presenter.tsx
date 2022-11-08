import { IBookViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const BookDetailPresenter = (
    bookAndActions: IDetailQueryResult<IBookViewModel>
): JSX.Element => GenericDetailPresenter(bookAndActions);
