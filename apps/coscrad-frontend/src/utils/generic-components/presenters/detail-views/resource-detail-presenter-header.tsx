import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { Grid } from '@mui/material';
import { Variant } from '@mui/material/styles/createTypography';
import { IdInfoIcon } from '../id-info-icon';
import { ResourceNamePresenter } from '../resource-name-presenter';

interface ResourceDetailPresenterHeaderProps {
    id: string;
    type: ResourceType;
    name: IMultilingualText | string;
    variant: Variant;
}

export const ResourceDetailPresenterHeader = ({
    id,
    type,
    name,
    variant,
}: ResourceDetailPresenterHeaderProps): JSX.Element => {
    return (
        <Grid container direction="row" spacing={1} alignItems="center" mb={1}>
            <Grid item>
                <IdInfoIcon id={id} type={type} />
            </Grid>
            <Grid item>
                <ResourceNamePresenter name={name} variant={variant} />
            </Grid>
        </Grid>
    );
};
