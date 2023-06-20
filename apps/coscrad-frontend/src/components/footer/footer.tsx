import { FacebookOutlined, GitHub, Instagram, Twitter, YouTube } from '@mui/icons-material';
import { Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { Tenant } from '../tenant/tenant';

export const Footer = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { subTitle, phoneNumber, address, internalLinks, socialMediaLinks } = useContext(
        ConfigurableContentContext
    );

    const socialMediaIcons = [
        {
            link: socialMediaLinks.facebook,
            icon: <FacebookOutlined />,
        },
        {
            link: socialMediaLinks.twitter,
            icon: <Twitter />,
        },
        {
            link: socialMediaLinks.github,
            icon: <GitHub />,
        },
        {
            link: socialMediaLinks.youtube,
            icon: <YouTube />,
        },
        {
            link: socialMediaLinks.instagram,
            icon: <Instagram />,
        },
    ];

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
            <Grid item>
                Phone: {phoneNumber}
                Address: {address}
            </Grid>
            <Grid item sx={{ textAlign: 'center' }}>
                {socialMediaIcons.map(({ link, icon }) =>
                    link ? (
                        <IconButton
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                            children={icon}
                        />
                    ) : (
                        ''
                    )
                )}
            </Grid>
            <Grid item sx={{ textAlign: 'center' }}>
                {internalLinks.map(({ description, url, iconUrl }) => (
                    <Tooltip title={description}>
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            <img height={50} src={iconUrl} alt={description} />
                        </a>
                    </Tooltip>
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
