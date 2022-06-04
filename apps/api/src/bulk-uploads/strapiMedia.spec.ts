import { strapiSongMapping } from './raw-data-mapper/mappers/strapi-song-mapper';
import { rawStrapiSongs } from './strapiSongs.data';

describe('testing strapi song mapper', () => {
    const result = rawStrapiSongs.map((strapiSong) => strapiSongMapping.apply(strapiSong));

    expect(result).toEqual([]);
});
