import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { ErrorDisplay } from '../../ErrorDisplay/ErrorDisplay';
import { Loading } from '../../Loading';

export const DynamicIndexContainer = (resourceType: string): JSX.Element => {
    const selector = (state: RootState) => state.resourceInfo;

    const { errorInfo, isLoading, data: allResourceInfo } = useSelector(selector);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    const searchResult = allResourceInfo.find(({ type }) => type === resourceType);

    if (typeof searchResult === 'undefined' || searchResult === null)
        return <ErrorDisplay code={500} message={`No Schema found for ${resourceType}`} />;

    // Should we return a container or presenter here?
};
