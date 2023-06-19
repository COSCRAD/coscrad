import { Grid, Tooltip, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { Tenant } from '../tenant/tenant';
export const Footer = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { subTitle, phoneNumber, address, internalLinks } = useContext(
        ConfigurableContentContext
    );

    return (
        <Grid
            container
            component="footer"
            direction="column"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: '#ededed',
            }}
        >
            <Grid>Phone: {phoneNumber}</Grid>
            <Grid>Address: {address}</Grid>
            <Grid>
                {internalLinks.map(({ url, iconUrl, description }) => (
                    <div>
                        <Tooltip title={description}>
                            <a href={url} target="_blank" rel="noopener noreferrer">
                                <img src={iconUrl} alt={description} />
                            </a>
                        </Tooltip>
                    </div>
                ))}
            </Grid>

            <Grid item>
                <Typography sx={{ textAlign: 'center' }} variant="subtitle1" color="text.secondary">
                    {subTitle}
                </Typography>
            </Grid>
            <Grid item>
                <Tenant />
            </Grid>
            <Grid item>
                <COSCRADByline />
            </Grid>
        </Grid>
    );
};
