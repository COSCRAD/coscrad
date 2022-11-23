import { IBookViewModel } from '@coscrad/api-interfaces';
import { BookIndexState } from '../../../store/slices/resources/books/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from '../vocabulary-lists/utils';

/**
 *  TODO [https://www.pivotaltracker.com/story/show/183681839]
 * We may some day read the actions and allow for bulk command execution in
 * an index view.
 */
export const BookIndexPresenter = ({ data: booksAndActions }: BookIndexState) => {
    /**
     * TODO[https://www.pivotaltracker.com/story/show/183681556]
     * Remove the need for this mapping.
     */
    const books = booksAndActions.map(({ data }) => data);

    const headingLabels: HeadingLabel<IBookViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'title', headingLabel: 'Title' },
        { propertyKey: 'author', headingLabel: 'Author' },
        { propertyKey: 'publicationDate', headingLabel: 'Publication Date' },
        // Or `Total Pages` or just `Pages`?
        { propertyKey: 'pages', headingLabel: 'Number of Pages' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IBookViewModel> = {
        id: renderAggregateIdCell,
        title: ({ title, subtitle }) => formatBilingualText(title, subtitle),
        pages: ({ pages }) => pages.length.toString(),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={books}
            cellRenderersDefinition={cellRenderersDefinition}
            /**
             * TODO[https://www.pivotaltracker.com/story/show/183867993]
             * This should be a resource label from resource info.
             */
            heading={'Books'}
        />
    );
};
