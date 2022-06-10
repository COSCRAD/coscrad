import { strapiSongMapping } from './raw-data-mapper/mappers/strapi-song-mapper';
import { rawStrapiSongs } from './strapiSongs.data';

// const numberOfSpacesToIndent = 4;

describe('testing strapi song mapper', () => {
    const result = rawStrapiSongs.map((strapiSong) => strapiSongMapping.apply(strapiSong));

    console.log({
        result,
    });

    // writeFileSync(
    //     'add-songs-from-strapi_FSAs_20220610.out.data.json',
    //     JSON.stringify(result, null, numberOfSpacesToIndent).concat('\n')
    // );

    expect(result).toEqual([]);
});
