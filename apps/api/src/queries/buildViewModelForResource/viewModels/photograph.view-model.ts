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

    constructor(photograph: Photograph, _allMediaItems: MediaItem[]) {
        super(photograph);

        const { photographer } = photograph;

        /**
         * TODO we are now event sourcing this view. We should cache the media
         * item ID and build the URL in the new query service layer. Since this
         * is done on another branch, we've made this property optional here and
         * will reconcile upon rebase.
         */
        // this.imageUrl = searchResult?.url;

        this.photographer = photographer;
    }
}
