import { EventBuilder, EventMetadataBuilder } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import {
    SpatialFeatureNameTranslated,
    SpatialFeatureNameTranslatedPayload,
} from '../../point/commands/translate-spatial-feature-name/spatial-feature-name-translated.event';
import { buildPointCreated } from './builders';

const buildPointNameTranslated = (
    payloadOverrides: SpatialFeatureNameTranslatedPayload,
    buildMetadata: EventMetadataBuilder
) =>
    new SpatialFeatureNameTranslated(
        buildTestInstance(SpatialFeatureNameTranslated, { payload: payloadOverrides }).payload,
        buildMetadata()
    );

export const getSpatialFeatureTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set('POINT_CREATED', buildPointCreated)
        .set('SPATIAL_FEATURE_NAME_TRANSLATED', buildPointNameTranslated);
