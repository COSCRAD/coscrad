import { IPlayListViewModel } from '@coscrad/api-interfaces';
import { MultilingualText } from '../../../domain/common/entities/multilingual-text';
import { Playlist } from '../../../domain/models/playlist';
import formatAggregateCompositeIdentifier from '../../presentation/formatAggregateCompositeIdentifier';
import { BaseViewModel } from './base.view-model';

export class PlaylistViewModel extends BaseViewModel implements IPlayListViewModel {
    readonly name: MultilingualText;

    // TODO establish a view model for episodes
    readonly episodes: string[];

    constructor({ id, name, items }: Playlist) {
        super({ id });

        this.name = name.clone();

        // TODO establish a view model for episodes
        this.episodes = items.map(({ resourceCompositeIdentifier }) =>
            formatAggregateCompositeIdentifier(resourceCompositeIdentifier)
        );
    }
}
