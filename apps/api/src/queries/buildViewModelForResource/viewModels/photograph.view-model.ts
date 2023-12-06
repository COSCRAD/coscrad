import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MediaItem } from '../../../domain/models/media-item/entities/media-item.entity';
import { Photograph } from '../../../domain/models/photograph/entities/photograph.entity';
import { BaseViewModel } from './base.view-model';

export class PhotographViewModel extends BaseViewModel implements IPhotographViewModel {
    @ApiProperty({
        example: 'https://www.myimages.com/mountains.png',
        description: 'a url where the client can fetch a digital version of the photograph',
    })
    readonly imageUrl: string;

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

    constructor(photograph: Photograph, allMediaItems: MediaItem[]) {
        super(photograph);

        const { mediaItemId, photographer } = photograph;

        const searchResult = allMediaItems.find(({ id }) => id === mediaItemId);

        this.imageUrl = searchResult?.url;

        this.photographer = photographer;
    }
}
