import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import formatAggregateCompositeIdentifier from '../../../queries/presentation/formatAggregateCompositeIdentifier';
import { CoscradDataExample } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateRoot, UpdateMethod } from '../../decorators';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import {
    buildAggregateRootFromEventHistory,
    CreationEventHandlerMap,
} from '../build-aggregate-root-from-event-history';
import { Resource } from '../resource.entity';
import { BaseEvent } from '../shared/events/base-event.entity';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { CreateMap } from './commands/create-map.command';
import { MapCreated } from './commands/map-created.event';
import { MapNameTranslated } from './commands/translate-map-name/map-name-translated.event';

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

    // TODO remove this
    protected getResourceSpecificAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }

    @UpdateMethod()
    translateName(translation: string, languageCode: LanguageCode) {
        const updatedName = this.name.translate({
            text: translation,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });

        if (isInternalError(updatedName)) {
            return updatedName;
        }

        this.name = updatedName;

        return this;
    }

    fromMapCreated(): GeospatialMap | InternalError {
        throw new Error('not implemented');
    }

    static fromEventHistory(
        eventHistory: BaseEvent[],
        id: AggregateId
    ): Maybe<ResultOrError<GeospatialMap>> {
        const creationEventHandlerMap: CreationEventHandlerMap<GeospatialMap> = new Map().set(
            'MAP_CREATED',
            GeospatialMap.buildGeospatialMapFromMapCreated
        );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.map,
                id,
            },
            eventHistory
        );
    }

    handleMapNameTranslated({
        payload: {
            translationOfName: { text, languageCode },
        },
    }: MapNameTranslated) {
        return this.translateName(text, languageCode);
    }

    static buildGeospatialMapFromMapCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            name,
            description,
        },
    }: MapCreated): ResultOrError<GeospatialMap> {
        const buildResult = new GeospatialMap({
            type: AggregateType.map,
            id,
            spatialFeatures: [],
            name: buildMultilingualTextWithSingleItem(name.text, name.languageCode),
            description: buildMultilingualTextWithSingleItem(
                description.text,
                description.languageCode
            ),
            published: false,
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                `Failed to build geospatialMap: ${formatAggregateCompositeIdentifier({
                    type: AggregateType.map,
                    id,
                })}from event history`,
                [invariantValidationResult]
            );
        }

        return buildResult;
    }
}
