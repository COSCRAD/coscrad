import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { Grid } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { ReactElement } from 'react';
import { IdInfoIcon } from '../id-info-icon/id-info-icon';
import { ResourceNamePresenter } from '../resource-name-presenter';

export interface ResourceNamePresenterProps {
    name: IMultilingualText;
    variant: Variant;
}

export interface ResourceNamePresenter {
    ({ name, variant }: ResourceNamePresenterProps): ReactElement;
}

interface ResourceDetailPresenterHeaderProps {
    id: string;
    type: ResourceType;
    name: IMultilingualText;
    variant: Variant;
    NamePresenter?: ResourceNamePresenter;
}

export const ResourceDetailPresenterHeader = ({
    id,
    type,
    name,
    variant,
    NamePresenter = ResourceNamePresenter,
}: ResourceDetailPresenterHeaderProps): JSX.Element => {
    return (
        <Grid container direction="row" spacing={1} alignItems="center" mb={2}>
            <Grid item>
                <NamePresenter name={name} variant={variant} />
            </Grid>
            <Grid item>
                <IdInfoIcon id={id} type={type} />
            </Grid>
        </Grid>
    );
};
