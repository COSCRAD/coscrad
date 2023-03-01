import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

export class PlaylistItem extends BaseDomainModel {
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;

    constructor(dto: DTO<PlaylistItem>) {
        super();

        if (!dto) return;

        const { resourceCompositeIdentifier } = dto;

        this.resourceCompositeIdentifier = resourceCompositeIdentifier;
    }
}
