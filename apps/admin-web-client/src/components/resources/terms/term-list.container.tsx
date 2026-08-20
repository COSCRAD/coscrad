import {
    AggregateType,
    IMultilingualText,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { HeadingLabel } from '../../shared/tables';
import { CellRenderersDefinition } from '../../shared/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../../shared/tables/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../../shared/tables/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../../shared/tables/render-multilingual-text-cell';
import { termApi } from './store';
import { TermIndexTable } from './term-index-table';

export const findOriginalMultilingualTextItem = (name: IMultilingualText) => {
    const item = name.items.find((item) => item.role === MultilingualTextItemRole.original);

    return item;
};

export const TermListContainer = (): JSX.Element => {
    const paginationOptions = useSelector((state: RootState) => state.termQueryOptions);

    console.log({ termListContainerPag: paginationOptions });

    // Note: `useQueryState()` here allows access to `isFetching` for no flicker
    // on fetching the next result set.  `keepUnusedDataFor: 300` in terms.api.ts
    // allows the existing data to remain in place while fetching the new terms set.
    const {
        data: serverData,
        isLoading,
        isFetching,
        isError,
    } = termApi.endpoints.fetchTerms.useQueryState(paginationOptions);

    // This is the flicker free term set held in place.  `setRenderedData()` is only
    // triggered when the new data is fully fetched (i.e., `!isFetching`)
    const [renderedData, setRenderedData] = useState(serverData);

    useEffect(() => {
        if (serverData && !isFetching) {
            setRenderedData(serverData);
        }
    }, [serverData, isFetching]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving data.</div>;

    const terms = renderedData?.entities;

    const headingLabels: HeadingLabel<ITermViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'name', headingLabel: 'Term' },
        { propertyKey: 'audioURL', headingLabel: 'Audio' },
        { propertyKey: 'contributions', headingLabel: 'Contributors' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, LanguageCode.Haida),
        audioURL: ({ audioURL }: ITermViewModel) =>
            isNullOrUndefined(audioURL) ? (
                <LinkOff color="primary" />
            ) : (
                <AudioClipPlayer audioUrl={audioURL} />
            ),
        contributions: ({ contributions }: ITermViewModel) =>
            renderContributionsTextCell(contributions),
    };

    return (
        <TermIndexTable
            type={AggregateType.term}
            headingLabels={headingLabels}
            tableData={(terms as ITermViewModel[]) || []}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Terms'}
        />
    );
};
