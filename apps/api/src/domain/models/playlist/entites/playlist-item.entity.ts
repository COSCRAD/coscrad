import { ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, UUID } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';

export enum PlaylistableResourceType {
    audioItem = ResourceType.audioItem,
}

export class PlaylistableResourceCompositeIdentifier {
    @ExternalEnum(
        {
            labelsAndValues: Object.entries(PlaylistableResourceType).map(([label, value]) => ({
                label,
                value: value as string,
            })),
            enumName: 'type',
            enumLabel: 'type',
        },
        {
            label: 'resource type',
            description: 'the type of the resource this playlist item is derived from',
        }
    )
    type: PlaylistableResourceType;

    @UUID({
        label: 'id',
        description: 'unique identifier',
    })
    id: AggregateId;
}

export class PlaylistItem extends BaseDomainModel {
    @NestedDataType(PlaylistableResourceCompositeIdentifier, {
        label: 'resource composite identifier',
        description:
            'system-wide unique identifier for the resource this playlist item was derived from',
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;

    constructor(dto: DTO<PlaylistItem>) {
        super();

        if (!dto) return;

        if (isNullOrUndefined(dto.resourceCompositeIdentifier)) return;

        const {
            resourceCompositeIdentifier: { type, id },
        } = dto;

        this.resourceCompositeIdentifier = { type, id };
    }
}
