import { IDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';

// TODO Bring across the custom component from the `tng-dictionary` project
// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailPresenter = (
    dataAndActions: IDetailQueryResult<ITermViewModel>
): JSX.Element => (
    <div>
        <h1>Term: {dataAndActions.data.id}</h1>
        <GenericDetailPresenter {...dataAndActions} />
    </div>
);
