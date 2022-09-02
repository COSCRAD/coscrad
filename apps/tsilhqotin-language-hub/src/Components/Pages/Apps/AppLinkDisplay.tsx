import AppLink from './data/AppLink';
import { AppPlatform } from './data/AppPlatform';


type ImageInfo = {
    alt: string;
    src: string;
    width: string;
};

const getImageInfoForPlatform = (platform: AppPlatform): ImageInfo => {
    if (platform === AppPlatform.google)
        return {
            alt: 'Get it on Google Play',
            src: 'https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png',
            width: '200px',
        };

    if (platform === AppPlatform.web)
        return {
            alt: 'Web Version',
            src: 'https://www.tsilhqotin.ca/wp-content/uploads/2021/01/web_verson_icon.png',
            width: '160px',
        };

    throw new Error('not implemented');
};

export function AppLinkDisplay({ platform, url }: AppLink) {
    const imageInfo = getImageInfoForPlatform(platform);
    return (
        <div className="appLinkDisplay">
            <a className="appLink" href={url}>
                <img
                    className="appLinkImage"
                    alt={imageInfo.alt}
                    src={imageInfo.src}
                    width={imageInfo.width}
                />
            </a>
        </div>
    );
}
