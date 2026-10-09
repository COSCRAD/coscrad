import { PageContentLayout } from '../page-content-layout';
import { ContributorIndexTable } from './contributor-index-table';

export const ContributorIndexPage = (): JSX.Element => {
    return (
        <PageContentLayout>
            <ContributorIndexTable />
        </PageContentLayout>
    );
};
