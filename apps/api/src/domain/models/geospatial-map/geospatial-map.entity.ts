import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateRoot } from '../../decorators';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { Aggregate } from '../aggregate.entity';
import { GeospatialMapCompositeIdentifier } from './commands/create-map.command';

@AggregateRoot(AggregateType.map)
export class GeospatialMap extends Aggregate {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'name',
        description: 'name for the map',
    })
    name: MultilingualText;

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'description',
        description: 'description for map',
    })
    description: MultilingualText;

    @NonEmptyString({
        label: 'points',
        description: 'description for the points',
        isArray: true,
    })
    spatialFeatures: AggregateId[];

    constructor(dto: DTO<GeospatialMap>) {
        super({ ...dto, type: ResourceType.map });

        if (!dto) return;

        const { name, description } = dto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);
    }

    protected validateComplexInvariants(): InternalError[] {
        throw new Error('Method not implemented.');
    }

    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }

    getName(): MultilingualText {
        return this.name;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return [];
    }

    fromMapCreated(): GeospatialMap | InternalError {
        throw new Error('not implemented');
    }
}
