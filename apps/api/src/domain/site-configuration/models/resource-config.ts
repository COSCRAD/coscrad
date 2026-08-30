import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import formatAggregateType from '../../../queries/presentation/formatAggregateType';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { CategorizableType } from '../../types/CategorizableType';

export class AggregateLabelOverrides {
    // TODO ML Text
    // TODO singularLabel, pluralLabel
    @NonEmptyString({
        label: 'label',
        description: 'label',
        isOptional: true,
    })
    label?: string;

    @NonEmptyString({
        label: 'plural label',
        description: 'plural label for aggregate',
        isOptional: true,
    })
    pluralLabel?: string;

    @NonEmptyString({
        label: 'route',
        description: 'route for aggregate',
        isOptional: true,
    })
    route?: string;
}

export enum DetailViewType {
    fullView = 'full-view',
    thumbnail = 'thumbnail-view',
}

/**
 * Note that these overrides should be merged with the `ResourceInfo`s.
 */
export class ResourceConfig {
    @ExternalEnum(
        {
            enumName: 'CategorizableType',
            enumLabel: 'Resource Type or Note',
            labelsAndValues: Object.values(CategorizableType).map((ct) => ({
                label: formatAggregateType(ct),
                value: ct,
            })),
        },
        {
            label: 'Resource Type or Note',
            description: 'Specifies whether this is a note or a specific kind of resource',
        }
    )
    categorizableType: CategorizableType;

    @ExternalEnum(
        {
            labelsAndValues: [
                {
                    label: 'full-view',
                    value: 'full-view',
                },
                {
                    label: 'thumbnail-view',
                    value: 'thumbnail-view',
                },
            ],
            enumName: 'DetailViewType',
            enumLabel: 'Detail View Type (thumbnail or full-view)',
        },
        {
            label: 'Detail View Type (thumbnail or full-view)',
            description: 'Specifies the view type for the detail view',
        }
    )
    detailViewType: DetailViewType;

    @NestedDataType(AggregateLabelOverrides, {
        label: 'label overrides',
        description: 'label overrides',
        isOptional: true,
    })
    labelOverrides?: AggregateLabelOverrides;

    constructor(dto: DeepPartial<DTO<ResourceConfig>>) {
        if (!dto) return;

        const { categorizableType, detailViewType, labelOverrides } = dto;

        this.categorizableType = categorizableType;

        this.detailViewType = detailViewType;

        this.labelOverrides = labelOverrides;
    }
}
