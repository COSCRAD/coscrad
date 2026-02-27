import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { SpatialFeatureCompositeIdentifier } from '../../../point/commands';

@Command({
    type: 'ADD_TRADITIONAL_NAME_FOR_SPATIAL_FEATURE',
    label: 'add traditional name for spatial feature',
    description: 'add traditional name for spatial feature',
})
export class AddTraditionalNameForSpatialFeature implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'spatial feature composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    readonly text: string;

    readonly languageCode: string;
}
