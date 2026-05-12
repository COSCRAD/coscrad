import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../../domain/common/entities/multilingual-text';
import { SpatialFeatureCompositeIdentifier } from '../create-point.command';

export class TranslateSpatialFeatureName implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NonEmptyString({
        label: 'translation',
        description: 'translation for the spatial feature',
    })
    translation: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are translating the spatial feature',
    })
    languageCode: LanguageCode;
}
