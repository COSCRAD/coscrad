import { strapiVideoMapper } from './raw-data-mapper/mappers/strapi-video-mapper';
import { rawStrapiVideos } from './strapiVideos.data';

// const numberOfSpacesToIndent = 4;

/**
 * Doing this in a Jest test is a hack for having a quick environment within
 * the backend to run a script that also leverages the domain (commands).
 */
describe.skip('testing strapi song mapper', () => {
    const result = rawStrapiVideos.map((strapiSong) => strapiVideoMapper.apply(strapiSong));

    // writeFileSync(
    //     'add-videos-from-strapi_FSAs_20220708.out.data.json',
    //     JSON.stringify(result, null, numberOfSpacesToIndent).concat('\n')
    // );

    expect(result).toEqual([]);
});
