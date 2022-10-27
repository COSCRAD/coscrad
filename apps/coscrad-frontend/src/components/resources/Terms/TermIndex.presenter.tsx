import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export const TermIndexPresenter: FunctionalComponent<IIndexQueryResult<IBaseViewModel>> = ({
    data: termsAndActions,
}: IIndexQueryResult<IBaseViewModel>) => {
    const terms = termsAndActions.map(({ data }) => data);

    // We may some day read the actions and allow for bulk command execution in index view
    return (
        <div>
            {terms.map((term) => (
                <div key={term.id} data-testid={term.id}>
                    {JSON.stringify(term)}
                </div>
            ))}
        </div>
    );
};
