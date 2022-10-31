import {
    ICommandFormAndLabels,
    IDetailQueryResult,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConfig } from '../../../config';
import { Loading } from '../../Loading';
import { DynamicIndexPresenter } from './DynamicIndexPresenter';

type DynamicIndexPageState = {
    detailDataAndActions: IDetailQueryResult[];
    actions: ICommandFormAndLabels[];
    isLoading: boolean;
};

const isDetailQueryResult = (input: unknown): input is IDetailQueryResult => {
    const { data } = input as IDetailQueryResult;

    if (data === null || typeof data === 'undefined') return false;

    return true;
};

const isIndexQueryResult = (input: unknown): input is IIndexQueryResult => {
    const test = input as IIndexQueryResult;

    const { data } = test;

    if (!Array.isArray(data)) return false;

    if (!data.every(isDetailQueryResult)) return false;

    return true;
};

/**
 * TODO Get state from Redux; no need to validate here.
 */
export const DynamicIndexPage = () => {
    const [pageState, setPageState] = useState<DynamicIndexPageState>({
        detailDataAndActions: [],
        actions: [],
        isLoading: false,
    });

    const location = useLocation();

    const schema = location.state?.schema;

    /**
     * TODO[https://www.pivotaltracker.com/story/show/183618729]
     * We need to read the config from context \ a provider.
     */
    const apiLink = `${getConfig().apiUrl}${location.state?.link}`;

    if (!isStringWithNonzeroLength(apiLink)) {
        throw new Error(`Invalid index endpoint: ${apiLink}`);
    }

    useEffect(() => {
        setPageState({ detailDataAndActions: [], actions: [], isLoading: true });

        fetch(apiLink, { mode: 'cors' })
            /**
             * TODO [https://www.pivotaltracker.com/story/show/183504753]
             * We need error handling for network errors or non-200 responses.
             */
            .then((res) => res.json())
            .then((rawResult) => {
                if (!isIndexQueryResult(rawResult)) {
                    throw new Error(
                        `Invalid response from the resource index endpoint: \n ${JSON.stringify(
                            rawResult
                        )}`
                    );
                }

                return rawResult as IIndexQueryResult;
            })
            .then((response) =>
                setPageState({
                    /**
                     * TODO[https://www.pivotaltracker.com/story/show/183456862]
                     * We should improve the naming of our index query response
                     * params.
                     */
                    detailDataAndActions: response.data,
                    // TODO consume dynamic forms with new API on frontend
                    actions: [], //response.actions,
                    isLoading: false,
                })
            )
            // TODO improve error handling
            .catch((rej) => {
                throw new Error(
                    `Failed to fetch resources for index from link: ${apiLink} \n ${rej}`
                );
            });
    }, []);

    if (pageState.isLoading) return <Loading></Loading>;

    return (
        <div>
            <DynamicIndexPresenter
                schema={schema}
                data={pageState.detailDataAndActions}
                actions={pageState.actions}
            ></DynamicIndexPresenter>
        </div>
    );
};
