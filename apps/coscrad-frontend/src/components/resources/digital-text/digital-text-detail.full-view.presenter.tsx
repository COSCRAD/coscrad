import { ICategorizableDetailQueryResult, IDigitalTextViewModel } from '@coscrad/api-interfaces';
import { ResourceNamePresenter } from '../../../utils/generic-components/presenters/resource-name-presenter';

export const DigitalTextDetailFullViewPresenter = ({
    id,
    title,
    pages,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    return (
        <>
            <ResourceNamePresenter name={title} variant="h2" />
            {/* {pages.length > 0 ? <PagesPresenter pages={pages} /> : null} */}
        </>
    );
};
