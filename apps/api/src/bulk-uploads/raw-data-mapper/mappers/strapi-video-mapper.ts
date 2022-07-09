import { MIMEType } from '@coscrad/data-types';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { DTO } from '../../../types/DTO';
import { FieldCalculationRules, RawDataMapping } from '../raw-data-mapping';
import { migrateUrl, StrapiWebMediaItem } from './strapi-song-mapper';

const parseOptionalTitleField = (name: string) => (isStringWithNonzeroLength(name) ? name : null);

const buildCreateMediaItemPayloadFromStrapiVideo: FieldCalculationRules<
    StrapiWebMediaItem,
    DTO<CreateMediaItem>
> = (raw: StrapiWebMediaItem) => {
    const {
        id,
        name,
        media: { url, mime },
        name_english,
    } = raw;

    return {
        id: id.toString(),
        title: parseOptionalTitleField(name),
        titleEnglish: parseOptionalTitleField(name_english),
        contributions: [
            {
                contributorId: 'enter ID here',
                role: 'enter role here',
            },
        ],
        url: migrateUrl(url),
        mimeType: mime as MIMEType,
        rawData: raw,
    };

    throw new Error('no timplemented');
};

export const strapiVideoMapper = new RawDataMapping<StrapiWebMediaItem, DTO<CreateMediaItem>>(
    buildCreateMediaItemPayloadFromStrapiVideo
);
