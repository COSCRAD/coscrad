import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { Divider } from '@mui/material';
import { getFooterConfig } from './footer.config';
import './Footer.css';

export function Footer() {
    return (
        <div className="footer">
            <div className="socialContainer">
                <section id="tngLogo">
                    <span id="initial">
                        <img
                            onClick={() =>
                                window.open(
                                    `${getFooterConfig().parentOrganizationSecondaryWebLogoUrl}`,
                                    '_blank',
                                    'noopener'
                                )
                            }
                            id="tngIcon"
                            height={42}
                            alt="tng"
                            src={`${getFooterConfig().parentOrganizationSecondaryWebLogoUrl}`}
                        />
                    </span>
                    <span id="onhover">
                        <img
                            onClick={() =>
                                window.open(
                                    `${getFooterConfig().socialMediaLinks[0].url}`,
                                    '_blank',
                                    'noopener'
                                )
                            }
                            id="tngIcon"
                            height={42}
                            alt="tng"
                            src={`${getFooterConfig().parentOrganizationWebLogoUrl}`}
                        />
                    </span>
                </section>
                <FacebookRoundedIcon
                    id="facebook"
                    onClick={() =>
                        window.open(
                            `${getFooterConfig().socialMediaLinks[1].url}`,
                            '_blank',
                            'noopener'
                        )
                    }
                    className="socialLinks"
                />
                <TwitterIcon
                    id="twitter"
                    onClick={() =>
                        window.open(
                            `${getFooterConfig().socialMediaLinks[2].url}`,
                            '_blank',
                            'noopener'
                        )
                    }
                    className="socialLinks"
                />
                <YouTubeIcon
                    id="youtube"
                    onClick={() =>
                        window.open(
                            `${getFooterConfig().socialMediaLinks[3].url}`,
                            '_blank',
                            'noopener'
                        )
                    }
                    className="socialLinks"
                />
                <GitHubIcon
                    id="github"
                    onClick={() =>
                        window.open(
                            `${getFooterConfig().socialMediaLinks[4].url}`,
                            '_blank',
                            'noopener'
                        )
                    }
                    className="socialLinks"
                />
                <InstagramIcon
                    id="instagram"
                    onClick={() =>
                        window.open(
                            `${getFooterConfig().socialMediaLinks[5].url}`,
                            '_blank',
                            'noopener'
                        )
                    }
                    className="socialLinks"
                />
            </div>
            <Divider className="footerDivider" />
            <div className="copyrightContainer">
                <div className="copyright">
                    © 2022 Tŝilhqot’in National Government.{' '}
                    <span id="rights">All Rights Reserved.</span>
                </div>
            </div>
        </div>
    );
}

export default Footer;
