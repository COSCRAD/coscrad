import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import {
    GenericIndexTablePresenter,
    HeadingLabel,
} from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';

export const PhotographIndexPresenter = (indexResult: IIndexQueryResult<IPhotographViewModel>) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: detailResult } = indexResult;

    const photographs = detailResult.map(({ data }) => data);

    const headingLabels: HeadingLabel<IPhotographViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'imageURL', headingLabel: 'Image URL' },
        { propertyKey: 'photographer', headingLabel: 'Photographer' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPhotographViewModel> = {
        id: ({ id }: IPhotographViewModel) => <Link to={id}>VIEW</Link>,
        imageURL: ({ imageURL }: IPhotographViewModel) => `LINK: ${imageURL}`,
    };

    return (
        <GenericIndexTablePresenter
            headingLabels={headingLabels}
            tableData={photographs}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource lable from resource info
            heading={'Photographs'}
        />
    );
};
