import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { GenericIndexPresenter } from '../../../utils/generic-components/presenters/generic-index-presenter';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export const TermIndexPresenter: FunctionalComponent<IIndexQueryResult<ITermViewModel>> = (
    termsIndexResult: IIndexQueryResult<ITermViewModel>
) => <GenericIndexPresenter {...termsIndexResult} />;
