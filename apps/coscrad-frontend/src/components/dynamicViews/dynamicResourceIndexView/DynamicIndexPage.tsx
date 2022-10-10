import { ICommandInfo, IDetailQueryResult, IIndexQueryResult } from '@coscrad/api-interfaces';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConfig } from '../../../config';
import { DynamicIndexPresenter } from './DynamicIndexPresenter';

type DynamicIndexPageState = {
    detailDataAndActions: IDetailQueryResult[];
    actions: ICommandInfo[];
};

const isCommandInfo = (input: unknown): input is ICommandInfo => {
    const { type, label, description } = input as ICommandInfo;

    console.log(`isCommandInfo? ${JSON.stringify(input)}`);

    if (!isStringWithNonzeroLength(type)) return false;

    if (!isStringWithNonzeroLength(label)) return false;

    if (!isStringWithNonzeroLength(description)) return false;

    // TODO Validate schema type
    return true;
};

const isDetailQueryResult = (input: unknown): input is IDetailQueryResult => {
    const { data, actions } = input as IDetailQueryResult;

    console.log(`isDetailQueryResult? ${JSON.stringify(input)}`);

    if (data === null || typeof data === 'undefined') return false;

    if (!actions.every(isCommandInfo)) return false;

    return true;
};

const isIndexQueryResult = (input: unknown): input is IIndexQueryResult => {
    const test = input as IIndexQueryResult;

    const { data, actions } = test;

    console.log(`isIndexQueryResult? ${JSON.stringify(input)}`);

    if (!Array.isArray(data)) return false;

    if (!data.every(isDetailQueryResult)) return false;

    if (!actions.every(isCommandInfo)) return false;

    return true;
};

export const DynamicIndexPage = () => {
    const [pageState, setPageState] = useState<DynamicIndexPageState>({
        detailDataAndActions: [],
        actions: [],
    });

    const location = useLocation();

    const schema = location.state?.schema;

    const apiLink = `${getConfig().apiUrl}${location.state?.link}`;

    if (!isStringWithNonzeroLength(apiLink)) {
        throw new Error(`Invalid index endpoint: ${apiLink}`);
    }

    useEffect(() => {
        setPageState({ detailDataAndActions: [], actions: [] });

        fetch(apiLink, { mode: 'cors' })
            // TODO We need error handling for network errors or non-200 responses.
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
                })
            )
            // TODO improve error handling
            .catch((rej) => {
                throw new Error(
                    `Failed to fetch resources for index from link: ${apiLink} \n ${rej}`
                );
            });
    }, []);

    if (pageState.detailDataAndActions.length === 0) return <div>Loading...</div>;

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
