import { ITermViewModel } from '@coscrad/api-interfaces';
import { TermIndexState } from '../../../store/slices/resources/terms/types/term-index-state';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

export const TermIndexPresenter = (termsIndexResult: TermIndexState) => {
    const { entities: terms } = termsIndexResult;

    const headingLabels: HeadingLabel<ITermViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'term', headingLabel: 'Term' },
        { propertyKey: 'termEnglish', headingLabel: 'English' },
        { propertyKey: 'audioURL', headingLabel: 'Audio URL' },
        { propertyKey: 'contributor', headingLabel: 'Contributor' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        termEnglish: ({ termEnglish }: ITermViewModel) => termEnglish,
        audioURL: ({ audioURL }: ITermViewModel) => audioURL,
        contributor: ({ contributor }: ITermViewModel) => contributor,
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={terms}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Terms'}
            filterableProperties={['term', 'termEnglish', 'contributor']}
        />
    );
};
