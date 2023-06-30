import {
    FacebookOutlined,
    GitHub,
    Instagram,
    LocationOn,
    Phone,
    Twitter,
    YouTube,
} from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { Box, Grid, IconButton, Modal, Tooltip, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { QRCodeForThisPage } from '../../utils/generic-components/qr-codes/qr-code-for-this-page';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { Tenant } from '../tenant/tenant';

export const Footer = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { subTitle, phoneNumber, address, internalLinks, socialMediaLinks, siteTitle } =
        useContext(ConfigurableContentContext);

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

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <Box>
            <Grid
                container
                component="footer"
                direction="column"
                spacing={0}
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: '#ededed',
                }}
            >
                <Grid container spacing={0} sx={{ padding: '20px' }}>
                    <Grid
                        item
                        xs={12}
                        sm={3}
                        component={Typography}
                        variant="subtitle1"
                        color="text.secondary"
                        sx={{ paddingLeft: '10px' }}
                    >
                        <h3>{siteTitle}</h3>

                        {subTitle}
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={3}
                        component={Typography}
                        variant="subtitle1"
                        color="text.secondary"
                    >
                        <Typography variant="h3">QR Code</Typography>
                        <IconButton color={'primary'} onClick={handleOpen}>
                            <QrCode2Icon />
                        </IconButton>
                        <Modal
                            open={open}
                            onClose={handleClose}
                            aria-labelledby="QR code for this page"
                            aria-describedby="get QR code for the current page"
                        >
                            <Box>
                                <QRCodeForThisPage />
                            </Box>
                        </Modal>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={3}
                        component={Typography}
                        variant="subtitle1"
                        color="text.secondary"
                    >
                        <Typography variant="h3">Contact</Typography>
                        <Box>
                            <IconButton color="primary">
                                <Phone />
                            </IconButton>
                            {phoneNumber}
                        </Box>

                        <Box>
                            <IconButton color="primary">
                                <LocationOn />
                            </IconButton>
                            {address}
                        </Box>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={3}
                        component={Typography}
                        variant="subtitle1"
                        color="text.secondary"
                    >
                        <Typography variant="h3">Links</Typography>
                        {socialMediaIcons
                            .map(({ link, icon }) =>
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
                            )
                            .filter((element) => element !== '')}
                        <Box>
                            {internalLinks.map(({ description, url, iconUrl }) => (
                                <Tooltip title={description}>
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                        <img height={40} src={iconUrl} alt={description} />
                                    </a>
                                </Tooltip>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Grid>
            <Grid container>
                <Grid sx={{ backgroundColor: '#ededed' }} item xs={12}>
                    <Tenant />
                </Grid>
                <Grid item xs={12}>
                    <COSCRADByline />
                </Grid>
            </Grid>
        </Box>
    );
};
