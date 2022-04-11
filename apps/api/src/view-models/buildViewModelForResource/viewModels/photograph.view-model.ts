import { ApiProperty } from '@nestjs/swagger';
import { Photograph } from 'apps/api/src/domain/models/photograph/entities/photograph.entity';
import { BaseViewModel } from './base.view-model';
import buildFullDigitalAssetURL from './utilities/buildFullDigitalAssetURL';

export class PhotographViewModel extends BaseViewModel {
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
        super({ id });

        // We need to store the MIME/type on the Photograph domain model
        this.imageURL = buildFullDigitalAssetURL(baseAudioURL, filename, 'png');

        this.photographer = photographer;
    }
}
