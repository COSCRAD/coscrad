import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, URL } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { BaseViewModel } from './base.view-model';
import buildFullDigitalAssetURL from './utilities/buildFullDigitalAssetURL';

export class PhotographViewModel extends BaseViewModel implements IPhotographViewModel {
    @ApiProperty({
        example: 'https://www.myimages.com/mountains.png',
        description: 'a url where the client can fetch a digital version of the photograph',
    })
    @URL({
        label: 'image link',
        description: 'a web link to a digital version of the photograph',
    })
    readonly imageURL: string;

    @ApiProperty({
        example: 'Justin Winters',
        description: 'the name of the photographer who took the photograph',
    })
    @FromDomainModel(Photograph)
    readonly photographer: string;

    /**
     * The frontend will determine the dimensions from the actual
     * image. Also, we may want to allow the frontend to request
     * different resolutions. We can worry about this when we get
     * there.
     */

    constructor({ id, filename, photographer }: Photograph, baseURL: string) {
        super({ id });

        // We need to store the MIME/type on the Photograph domain model
        this.imageURL = buildFullDigitalAssetURL(baseURL, filename, 'png');

        this.photographer = photographer;
    }
}
