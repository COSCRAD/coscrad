import { ApiProperty } from '@nestjs/swagger';
import { Photograph } from 'apps/api/src/domain/models/photograph/entities/photograph.entity';
import { EntityId } from 'apps/api/src/domain/types/EntityId';
import buildFullAudioURL from './utilities/buildFullAudioURL';

export class PhotographViewModel {
    // Should this be `ViewModelId`
    @ApiProperty({
        example: '12',
        description: 'uniquely identifies a tag amongst other tags',
    })
    readonly id: EntityId;

    @ApiProperty({
        example: 'https://www.myimages.com/mountains.png',
        description: 'a url where the client can fetch a digital version of the photograph',
    })
    readonly imageURL: string;

    @ApiProperty({
        example: 'Justin Winters',
        description: 'the name of the photographer who took the photograph',
    })
    readonly photographer: string;

    /**
     * The frontend will determine the dimensions from the actual
     * image. Also, we may want to allow the frontend to request
     * different resolutions. We can worry about this when we get
     * there.
     */

    constructor({ id, filename, photographer }: Photograph, baseAudioURL: string) {
        this.id = id;

        // We need to store the MIME/type on the Photograph domain model
        this.imageURL = buildFullAudioURL(baseAudioURL, filename, 'png');

        this.photographer = photographer;
    }
}
