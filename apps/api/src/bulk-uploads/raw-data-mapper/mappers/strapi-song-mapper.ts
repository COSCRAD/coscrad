import { isStringWithNonzeroLength } from '@coscrad/validation';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { DTO } from '../../../types/DTO';
import { FieldCalculationRules, RawDataMapping } from '../raw-data-mapping';

export const migrateUrl = (url: string) =>
    `https://be.tsilhqotinlanguage.ca:3003/download?id=${url.replace('/uploads/', '')}`;

export type StrapiMedia = {
    id: number;
    name: string;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    created_at: string;
    updated_at: string;
};

export type SongMetadata = {
    year: string;
    title: string;
    artists: string[];
    language: string;
    processing: string;
};

export type StrapiWebMediaItem = {
    id: number;
    name: string;
    name_english: string;
    // contributor: null,
    credits: Record<string, string>;
    published_at: string;
    created_at: string;
    updated_at: string;
    metadata: SongMetadata;
    performer: number;
    author: number;
    transcriber: number;
    comments: string;
    lyrics: string;
    media: StrapiMedia;
};

const strapiToCommandFieldCalculationRules: FieldCalculationRules<
    StrapiWebMediaItem,
    DTO<CreateSong>
> = (raw: StrapiWebMediaItem) => {
    const {
        id,
        lyrics,
        name,
        media: { url },
        name_english,
        performer,
        author,
        transcriber,
    } = raw;

    return {
        id: id.toString(),
        title: isStringWithNonzeroLength(name) ? name : null,
        titleEnglish: isStringWithNonzeroLength(name_english) ? name_english : null,
        contributorAndRoles: []
            .concat(
                performer
                    ? {
                          contributorId: performer.toString(),
                          role: 'performer',
                      }
                    : null
            )
            .concat(
                author
                    ? {
                          contributorId: author.toString(),
                          role: 'author',
                      }
                    : null
            )
            .concat(
                transcriber
                    ? {
                          contributorId: transcriber.toString(),
                          role: 'transcriber',
                      }
                    : null
            )
            .concat({
                // Aaron!
                contributorId: '31',
                role: 'recorded and edited audio',
            })
            .filter((c) => c !== null),
        lyrics: lyrics,
        audioURL: migrateUrl(url),
        rawData: raw,
        lengthMilliseconds: 0,
    };
};

export const strapiSongMapping = new RawDataMapping<StrapiWebMediaItem, DTO<CreateSong>>(
    strapiToCommandFieldCalculationRules
);
