import { isNonEmptyString } from '@coscrad/validation-constraints';
import {
    AlternateEmail,
    FacebookOutlined,
    GitHub,
    Instagram,
    LocationOn,
    Phone,
    Twitter,
    YouTube,
} from '@mui/icons-material';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { Box, Grid, IconButton, Modal, Tooltip, Typography, styled } from '@mui/material';
import React, { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { QRCodeForThisPage } from '../../utils/generic-components/qr-codes/qr-code-for-this-page';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { Tenant } from '../tenant/tenant';

export const Footer = (): JSX.Element => {
    const StyledQRCode = styled(Box)`
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        box-shadow: 24px;
        padding: 12px;
        border-radius: 4px;
        text-align: center;
    `;
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { subTitle, phoneNumber, email, address, internalLinks, socialMediaLinks, siteTitle } =
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
        <Box
            component="footer"
            sx={{
                backgroundColor: '#ededed',
                position: 'relative',
                marginTop: 'auto',
                bottom: 0,
                left: 0,
                width: '100%',
                paddingBottom: '15px',
            }}
        >
            <Grid
                container
                direction="row"
                spacing={0}
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                }}
            >
                <Grid item xs={12} sm={3} color="text.secondary" sx={{ pl: '10px' }}>
                    <Typography color="primary.main" variant="h3">
                        {siteTitle}
                    </Typography>
                    <Typography variant="subtitle1">{subTitle}</Typography>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ pl: '10px' }} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        QR Code
                    </Typography>
                    <IconButton color="secondary" onClick={handleOpen}>
                        <QrCode2Icon />
                    </IconButton>
                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="QR code for this page"
                        aria-describedby="get QR code for the current page"
                    >
                        <StyledQRCode>
                            <QRCodeForThisPage />
                        </StyledQRCode>
                    </Modal>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ pl: '10px' }} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        Contact
                    </Typography>
                    {isNonEmptyString(email) ? (
                        <Box>
                            <IconButton color="secondary">
                                <AlternateEmail id="email-icon" />
                            </IconButton>
                            {email}
                        </Box>
                    ) : null}

                    {isNonEmptyString(phoneNumber) ? (
                        <Box>
                            <IconButton color="secondary">
                                <Phone />
                            </IconButton>
                            {phoneNumber}
                        </Box>
                    ) : null}
                    <Box>
                        <IconButton color="secondary">
                            <LocationOn />
                        </IconButton>
                        {address}
                    </Box>
                </Grid>
                <Grid item xs={12} sm={3} sx={{ pl: '10px' }} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        Links
                    </Typography>
                    {socialMediaIcons
                        .map(({ link, icon }) =>
                            link ? (
                                <IconButton
                                    key={link}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    color="secondary"
                                    children={icon}
                                />
                            ) : (
                                ''
                            )
                        )
                        .filter((element) => element !== '')}
                    <Box>
                        {internalLinks.map(({ description, url, iconUrl }) => (
                            <Tooltip key={url} title={description}>
                                <a href={url} target="_blank" rel="noopener noreferrer">
                                    <img height={40} src={iconUrl} alt={description} />
                                </a>
                            </Tooltip>
                        ))}
                    </Box>
                </Grid>
                <Grid item xs={12} sx={{ pt: 2 }}>
                    <Tenant />
                </Grid>
                <Grid item xs={12}>
                    <COSCRADByline />
                </Grid>
            </Grid>
        </Box>
    );
};
