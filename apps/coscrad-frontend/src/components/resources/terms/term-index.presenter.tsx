import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

//export const TermIndexPresenter: FunctionalComponent<IIndexQueryResult<ITermViewModel>> = (
//    termsIndexResult: IIndexQueryResult<ITermViewModel>
// ) => <GenericIndexPresenter {...termsIndexResult} indexLabel={'Terms'} />;

export const TermIndexPresenter = (termsIndexResult: IIndexQueryResult<ITermViewModel>) => {
    const { data: detailResult } = termsIndexResult;

    const terms = detailResult.map(({ data }) => data);

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
        />
    );
};
