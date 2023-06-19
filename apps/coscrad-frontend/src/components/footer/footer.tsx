import { FacebookOutlined, GitHub, Twitter, YouTube } from '@mui/icons-material';
import { Grid, IconButton, Typography } from '@mui/material';
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
            <Grid item>
                {internalLinks.map(({ url, iconUrl, description }) => (
                    // <Tooltip title={description}>
                    <IconButton
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                    >
                        {/* <img width={100} src={iconUrl} alt={description} /> */}
                        {url.includes('facebook') && <FacebookOutlined />}
                        {url.includes('youtube') && <YouTube />}
                        {url.includes('twitter') && <Twitter />}
                        {url.includes('github') && <GitHub />}
                    </IconButton>
                    // </Tooltip>
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
