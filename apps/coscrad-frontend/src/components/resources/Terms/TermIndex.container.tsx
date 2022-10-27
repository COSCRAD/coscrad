import { HttpStatusCode, IIndexQueryResult } from '@coscrad/api-interfaces';
import { RootState } from '../../../store';
import { fetchResourceInfos } from '../../../store/slices/resourceInfoSlice';
import { fetchTerms } from '../../../store/slices/resources';
import { useLoadable } from '../../../utils/custom-hooks/useLoadable';
import { DynamicIndexPresenter } from '../../dynamicViews/dynamicResourceIndexView';
import { ErrorDisplay } from '../../ErrorDisplay/ErrorDisplay';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { Loading } from '../../Loading';

export const TermIndexContainer = (): JSX.Element => {
    const [loadableTerms] = useLoadable({
        selector: (state: RootState) => state.terms,
        fetchThunk: fetchTerms,
    });

    // We may want to leverage useLoadable here as well

    const [loadableResourceInfos] = useLoadable({
        selector: (state: RootState) => state.resourceInfo,
        fetchThunk: fetchResourceInfos,
    });

    const { isLoading, errorInfo, data: resourceInfos } = loadableResourceInfos;

    if (isLoading) return <Loading />;

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    console.log({ resourceInfos });

    const termInfo = resourceInfos.find(({ type }) => type === 'term');

    if (!termInfo)
        return (
            <ErrorDisplay
                code={HttpStatusCode.internalError}
                message={'No Schema Found for term'}
            />
        );

    const { schema } = termInfo;

    // TODO stop calling every prop in site data!
    const TermIndexPresenter = (indexQueryResult: IIndexQueryResult) =>
        DynamicIndexPresenter({
            data: indexQueryResult.data,
            schema,
            actions: indexQueryResult.actions,
        });

    // Double check typesafety in places like this
    const LoadableTermPresenter = displayLoadableWithErrorsAndLoading(TermIndexPresenter);

    return <LoadableTermPresenter {...loadableTerms} />;
};
