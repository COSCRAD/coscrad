import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateRoot } from '../../decorators';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { Resource } from '../resource.entity';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { CreateMap } from './commands/create-map.command';

@CoscradDataExample<GeospatialMap>({
    example: {
        type: ResourceType.map,
        id: buildDummyUuid(961),
        published: false,
        name: buildMultilingualTextWithSingleItem('My map'),
        description: buildMultilingualTextWithSingleItem('This is a description of my test map'),
        spatialFeatures: [],
    },
})
@AggregateRoot(AggregateType.map)
export class GeospatialMap extends Resource {
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name for the map',
    })
    name: MultilingualText;

    @NestedDataType(MultilingualText, {
        label: 'description',
        description: 'description for map',
    })
    description: MultilingualText;

    @NonEmptyString({
        label: 'points',
        description: 'the spatial features that have been collected into this map',
        isArray: true,
        isOptional: true,
    })
    spatialFeatures: AggregateId[];

    constructor(dto: DTO<GeospatialMap>) {
        super({ ...dto, type: ResourceType.map });

        if (!dto) return;

        const { name, description, spatialFeatures } = dto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);

        this.spatialFeatures = spatialFeatures;
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    // TODO it's time to move this to the views
    getAvailableCommands(): string[] {
        return [];
    }

    getName(): MultilingualText {
        return this.name;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        return [];
    }

    // TODO put this on the view
    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    static fromUserRequest({
        aggregateCompositeIdentifier: { id },
        name,
        languageCodeForDescription,
        languageCodeForName,
        description,
    }: CreateMap): GeospatialMap | InternalError {
        const instance = new GeospatialMap({
            type: AggregateType.map,
            id,
            name: buildMultilingualTextWithSingleItem(name, languageCodeForName),
            description: buildMultilingualTextWithSingleItem(
                description,
                languageCodeForDescription
            ),
            spatialFeatures: [],
            published: false,
        });

        const validationResult = instance.validateInvariants();

        if (isInternalError(validationResult)) {
            return validationResult;
        }

        return instance;
    }
}
