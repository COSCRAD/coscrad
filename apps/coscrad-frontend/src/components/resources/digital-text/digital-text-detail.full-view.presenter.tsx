import {
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components';
import { PagesPresenter } from './pages-presenter';

export const DigitalTextDetailFullViewPresenter = ({
    id,
    title: name,
    pages,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.digitalText}>
            {pages.length > 0 ? <PagesPresenter pages={pages} /> : null}
        </ResourceDetailFullViewPresenter>
    );
};
