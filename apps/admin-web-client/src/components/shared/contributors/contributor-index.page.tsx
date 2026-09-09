import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ContributorIndexTable } from './contributor-index-table';
import { ResourcePaginator } from './contributor-paginator';
import { useFetchContributorsQuery } from './store';

export const ContributorIndexPage = (): JSX.Element => {
    const contributorQueryOptions = useSelector((state: RootState) => state.termQueryOptions);

    const { data, isLoading, isError } = useFetchContributorsQuery(contributorQueryOptions);

    return (
        <>
            <ContributorIndexTable />
            <ResourcePaginator />
        </>
    );
};
