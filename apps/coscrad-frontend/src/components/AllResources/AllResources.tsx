import { useEffect, useState } from 'react';
import { getConfig } from '../../config';
import ResourceInfoPresenter, {
    ResourceInfo,
} from '../presenters/ResourceInfoPresenter/ResourceInfoPresenter';
import './AllEntities.module.scss';

type ComponentState = {
    resourceInfos: ResourceInfo[];
};

export function AllResources() {
    const [appState, setAppState] = useState<ComponentState>({
        resourceInfos: [],
    });

    useEffect(() => {
        setAppState({ resourceInfos: [] });

        const apiUrl = `${getConfig().apiUrl}/api/resources/`;

        fetch(apiUrl, { mode: 'cors' })
            .then((res) => {
                const result = res.json();

                return result;
            })
            .then((resourceInfos) => {
                console.log({
                    apiResult: resourceInfos,
                });
                setAppState({ ...appState, resourceInfos: resourceInfos });
            })
            .catch((rej) => console.log(rej));
    }, []);

    if (appState.resourceInfos.length === 0) return <div>Loading...</div>;

    if (!Array.isArray(appState.resourceInfos))
        return (
            <div>
                ERROR: Resource infos is not an array. Resource infos:
                {JSON.stringify(appState.resourceInfos)}
            </div>
        );

    return (
        <div>
            <h1>Available Resources</h1>
            <div>
                {appState.resourceInfos.map((info) => (
                    <ResourceInfoPresenter {...info}></ResourceInfoPresenter>
                ))}
            </div>
        </div>
    );
}
