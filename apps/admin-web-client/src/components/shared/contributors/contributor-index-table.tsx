import { AggregateType, ICoscradContributorViewModel } from '@coscrad/api-interfaces';
import { useEffect, useState } from 'react';
import { NewIndexTable } from '../../resources/terms/term-index-table';
import { HeadingLabel } from '../tables';
import { CellRenderersDefinition } from '../tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../tables/render-aggregate-id-cell';
import { contributorApi } from './store';

export const ContributorIndexTable = (): JSX.Element => {
    const {
        data: serverData,
        isLoading,
        isFetching,
        isError,
    } = contributorApi.endpoints.fetchContributors.useQueryState();

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

    const contributors = renderedData?.entities;

    const headingLabels: HeadingLabel<ICoscradContributorViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'fullName', headingLabel: 'Full Name' },
        { propertyKey: 'shortBio', headingLabel: 'Short Bio' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ICoscradContributorViewModel> = {
        id: renderAggregateIdCell,
    };

    return (
        <NewIndexTable
            type={AggregateType.contributor}
            headingLabels={headingLabels}
            tableData={(contributors as ICoscradContributorViewModel[]) || []}
            cellRenderersDefinition={cellRenderersDefinition}
        />
    );
};
