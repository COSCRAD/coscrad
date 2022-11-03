import { IDetailQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

export const VocabularyListDetailPresenter = (
    vocabularyListAndActions: IDetailQueryResult<IVocabularyListViewModel>
): JSX.Element => GenericDetailPresenter(vocabularyListAndActions);
