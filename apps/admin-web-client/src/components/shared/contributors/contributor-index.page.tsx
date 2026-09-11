import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ContributorIndexTable } from './contributor-index-table';
import { ResourcePaginator } from './contributor-paginator';
import { useFetchContributorsQuery } from './store';

export const ContributorIndexPage = (): JSX.Element => {
    const contributorIndexQueryOptions = useSelector(
        (state: RootState) => state.contributorIndexQueryOptionsSlice
    );

    const { data, isLoading, isError } = useFetchContributorsQuery(contributorIndexQueryOptions);

    return (
        <>
            <ContributorIndexTable />
            <ResourcePaginator />
        </>
    );
};
