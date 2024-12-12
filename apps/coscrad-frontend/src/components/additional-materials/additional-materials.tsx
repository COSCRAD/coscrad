import { MIMEType } from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { AdditionalMaterialItem } from '../../configurable-front-matter/data/configurable-content-schema';
import { ErrorDisplay } from '../error-display/error-display';
import { NotFoundPresenter } from '../not-found';

const MediaItemPresenter = ({
    url,
    mimeType,
    name,
    description,
}: AdditionalMaterialItem['media']): JSX.Element => {
    if (![MIMEType.mp3, MIMEType.wav, MIMEType.audioOgg].includes(mimeType)) {
        return <ErrorDisplay code={500} message={`Unsupported media item type: ${MIMEType}`} />;
    }

    return (
        <>
            <h2>{name}</h2>
            <p>{description}</p>
            <AudioPlayer audioUrl={url} />
        </>
    );
};

const PdfPresenter = ({ url, name, description }: AdditionalMaterialItem['pdf']): JSX.Element => {
    return (
        <>
            <h3>pdf</h3>
            <a href={url} target="_blank" rel="noopener noreferrer">
                {name}
            </a>
            <p>{description}</p>
        </>
    );
};

export const AdditionalMaterials = (): JSX.Element => {
    const { additionalMaterials } = useContext(ConfigurableContentContext);

    if (additionalMaterials.length === 0) return <NotFoundPresenter />;

    return (
        <>
            {additionalMaterials
                .filter(({ pdf, media }) => !isNullOrUndefined(pdf) || !isNullOrUndefined(media))
                .map(({ pdf, media }) => (
                    <div>
                        {isNullOrUndefined(media) ? null : <MediaItemPresenter {...media} />}
                        {isNullOrUndefined(pdf) ? null : <PdfPresenter {...pdf} />}
                    </div>
                ))}
        </>
    );
};
