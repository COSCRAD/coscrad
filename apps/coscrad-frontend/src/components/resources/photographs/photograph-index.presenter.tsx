import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';

export const PhotographIndexPresenter = (indexResult: IIndexQueryResult<IPhotographViewModel>) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data } = indexResult;
    const dataLabels = ['id', 'imageUrl', 'photographer'];
    // pass dataLabels and photographs array into table component
    const photographs = data
        .map(({ data: photograph }) => photograph)
        .map((photograph) => {
            return {
                id: photograph.id,
                imageUrl: photograph.imageURL,
                photographer: photograph.photographer,
            };
        });

    return (
        <div>
            <h3>Photographs</h3>
            <div className="records-table">
                <table border={0} cellSpacing={0} cellPadding={7}>
                    <tbody>
                        <tr>
                            <th>Link</th>
                            <th>Image File URL</th>
                            <th>Photographer</th>
                        </tr>
                        {/* {photographs.map(({ data: photograph }) => (
                            <tr>
                                <td>
                                    <Link to={photograph.id}>View ID {photograph.id}</Link>
                                </td>
                                <td>{photograph.imageURL}</td>
                                <td>{photograph.photographer}</td>
                            </tr>
                        ))} */}
                    </tbody>
                </table>
            </div>
            <h3>JSON Data</h3>
            <div className="json-data">
                <pre>{JSON.stringify(photographs, null, 2)}</pre>
            </div>
        </div>
    );
};
