import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { BaseViewModel } from './base.view-model';

const FromPhotograph = FromDomainModel(Photograph);

export class PhotographViewModel extends BaseViewModel implements IPhotographViewModel {
    @ApiProperty({
        example: 'https://www.myimages.com/mountains.png',
        description: 'a url where the client can fetch a digital version of the photograph',
    })
    @FromPhotograph
    readonly imageURL: string;

    @ApiProperty({
        example: 'Justin Winters',
        description: 'the name of the photographer who took the photograph',
    })
    @FromPhotograph
    readonly photographer: string;

    /**
     * The frontend will determine the dimensions from the actual
     * image. Also, we may want to allow the frontend to request
     * different resolutions. We can worry about this when we get
     * there.
     */

    constructor(photograph: Photograph) {
        super(photograph);

        const { imageUrl, photographer } = photograph;

        // TODO make `imageUrl` a `mediaItemId` instead
        this.imageURL = imageUrl;

        this.photographer = photographer;
    }
}
