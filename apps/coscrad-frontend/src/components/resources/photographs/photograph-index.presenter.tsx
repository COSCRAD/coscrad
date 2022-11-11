import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import {
    GenericIndexTablePresenter,
    HeadingLabel,
    Renderer,
} from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter';

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

    /**
     * Note that for some reason we don't get type safety unless we use the
     * generics on the Map. We might want an abstraction that takes in an array
     * or object data structure (in a type safe way) and creates this map.
     */
    const cellRenderers = new Map<keyof IPhotographViewModel, Renderer<IPhotographViewModel>>()
        .set('imageURL', ({ imageURL }: IPhotographViewModel) => `LINK: ${imageURL}`)
        .set('id', ({ id }: IPhotographViewModel) => <Link to={id}>VIEW</Link>);

    return (
        <div>
            <h3>Photographs</h3>
            <div className="records-table">
                <GenericIndexTablePresenter
                    headingLabels={headingLabels}
                    tableData={photographs}
                    cellRenderers={cellRenderers}
                />
            </div>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(photographs, null, 2)}</pre>
            </div>
        </div>
    );
};
