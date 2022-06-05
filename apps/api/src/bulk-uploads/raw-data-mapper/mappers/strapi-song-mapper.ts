import { AddSong } from '../../../domain/models/song/commands/add-song.command';
import { DTO } from '../../../types/DTO';
import { FieldCalculationRules, RawDataMapping } from '../raw-data-mapping';

type StrapiMedia = {
    id: number;
    name: string;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    created_at: string;
    updated_at: string;
    // we must add this- it's not in Strapi!
    length: number;
};

type SongMetadata = {
    year: string;
    title: string;
    artists: string[];
    language: string;
    processing: string;
};

export type StrapiSong = {
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

const strapiToCommandFieldCalculationRules: FieldCalculationRules<StrapiSong, DTO<AddSong>> = {
    id: ({ id }: StrapiSong) => id.toString(),
    title: ({ name }: StrapiSong) => name,
    titleEnglish: ({ name_english }: StrapiSong) => name_english,
    contributorAndRoles: ({ performer, author, transcriber }: StrapiSong) =>
        []
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
    lyrics: ({ lyrics }: StrapiSong) => lyrics,
    audioURL: ({ media: { url } }: StrapiSong) => `https://api.tsilhqotinlanguage.ca${url}`,
    rawData: (raw: StrapiSong) => raw,
    lengthMilliseconds: ({ media: { length } }: StrapiSong) => length,
};

export const strapiSongMapping = new RawDataMapping<StrapiSong, DTO<AddSong>>(
    strapiToCommandFieldCalculationRules
);
