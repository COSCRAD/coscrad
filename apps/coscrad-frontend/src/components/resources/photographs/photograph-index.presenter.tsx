import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import {
    GenericIndexTablePresenter,
    HeadingLabel,
} from 'apps/coscrad-frontend/src/utils/generic-components/presenters/tables/generic-index-table-presenter';

export const PhotographIndexPresenter = (indexResult: IIndexQueryResult<IPhotographViewModel>) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: detailResult } = indexResult;

    const photographs = detailResult.map(({ data }) => data);

    const headingLabels: HeadingLabel<IPhotographViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'ID' },
        { propertyKey: 'imageURL', headingLabel: 'Image URL' },
        { propertyKey: 'photographer', headingLabel: 'Photographer' },
    ];

    return (
        <div>
            <h3>Photographs</h3>
            <div className="records-table">
                <GenericIndexTablePresenter headingLabels={headingLabels} tableData={photographs} />
            </div>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(photographs, null, 2)}</pre>
            </div>
        </div>
    );
};
