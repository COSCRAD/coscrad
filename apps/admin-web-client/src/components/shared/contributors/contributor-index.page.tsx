import { useEffect, useState } from 'react';
import { ContributorIndexTable } from './contributor-index-table';
import { contributorApi } from './store';

export const ContributorIndexPage = (): JSX.Element => {
    const {
        data: serverData,
        isLoading,
        isFetching,
        isError,
    } = contributorApi.endpoints.fetchContributors.useQuery();

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

    return <ContributorIndexTable contributors={contributors} />;
};
