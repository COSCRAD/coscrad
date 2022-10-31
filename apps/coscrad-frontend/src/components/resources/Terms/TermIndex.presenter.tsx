import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { FunctionalComponent } from '../../../utils/types/functional-component';

export const TermIndexPresenter: FunctionalComponent<IIndexQueryResult<ITermViewModel>> = ({
    data: termsAndActions,
}: IIndexQueryResult<ITermViewModel>) => {
    const terms = termsAndActions.map(({ data }) => data);

    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    return (
        <div>
            {terms.map((term) => (
                <Link to={term.id} key={term.id}>
                    <div data-testid={term.id}>{JSON.stringify(term)}</div>
                </Link>
            ))}
        </div>
    );
};
