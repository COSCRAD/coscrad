import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { HasData } from '../../higher-order-components';
import { ResourceInfoPresenter } from './resource-info.presenter';

type ResourceInfosPresenterProps = HasData<IAggregateInfo<ResourceType>[]>;
/**
 * Note the plural in the name. This presents all of the resource infos. It
 * maps through the singular `ResourceInfoPresenter` to do so.
 */

export const ResourceInfosPresenter: FunctionalComponent<ResourceInfosPresenterProps> = ({
    data: resourceInfos,
}: ResourceInfosPresenterProps) => {
    const { resourceIndexLabel } = useContext(ConfigurableContentContext);

    return (
        <>
            <Typography variant="h2">{resourceIndexLabel}</Typography>
            <Stack data-cy="resourceInfos-stack" spacing={1}>
                {resourceInfos.map((info) => {
                    return <ResourceInfoPresenter {...info} key={info.type} route={info.link} />;
                })}
            </Stack>
        </>
    );
};
