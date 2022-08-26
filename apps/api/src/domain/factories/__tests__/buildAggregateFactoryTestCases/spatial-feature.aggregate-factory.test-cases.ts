import { getValidSpatialFeatureInstanceForTest } from '../../../../domain/domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/getValidSpatialFeatureInstanceForTest';
import { formatGeometricFeatureType } from '../../../../view-models/presentation/formatGeometricFeatureType';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from './';
import buildValidCasesForSubtypes from './common/buildValidCasesForSubtypes';

const aggregateType = AggregateType.spatialFeature;

const validCases: AggregateFactoryValidTestCase<typeof aggregateType>[] =
    buildValidCasesForSubtypes(
        aggregateType,
        Object.values(GeometricFeatureType),
        formatGeometricFeatureType,
        getValidSpatialFeatureInstanceForTest
    );

export const buildSpatialFeatureFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases,
    invalidCases: [],
});
