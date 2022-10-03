import { isStringWithNonzeroLength } from '@coscrad/validation';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConfig } from '../../../config';
import DynamicIndexPresenter from './DynamicIndexPresenter';

type DynamicIndexPageState = {
    detailDataAndActions: [];
    actions: [];
};

export default () => {
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
            // .then((res) => {
            //     if (res.status !== 400) {
            //         throw new Error(`The index request to: ${apiLink} failed. \n ${res.json()}`);
            //     }
            //     return res;
            // })
            .then((res) => res.json())
            .then((response) =>
                setPageState({
                    // We should improve the naming of our index query response params
                    detailDataAndActions: response.data,
                    actions: response.actions,
                })
            )
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
