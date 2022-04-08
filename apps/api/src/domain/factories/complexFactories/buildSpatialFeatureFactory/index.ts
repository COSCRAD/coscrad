import { PartialDTO } from 'apps/api/src/types/partial-dto';
import spatialFeatureValidator from '../../../domainModelValidators/spatialFeatureValidator';
import { isValid } from '../../../domainModelValidators/Valid';
import { ISpatialFeature } from '../../../models/spatial-feature/ISpatialFeature';
import { InstanceFactory } from '../../getInstanceFactoryForEntity';
import buildSpatialFeatureModel from './buildSpatialFeatureModel';

const spatialDataFactory: InstanceFactory<ISpatialFeature> = (dto: unknown) => {
    const validationResult = spatialFeatureValidator(dto);

    // Return error if the dto does not satisfy domain model invariants
    if (!isValid(validationResult)) return validationResult;

    return buildSpatialFeatureModel(dto as PartialDTO<ISpatialFeature>);
};

export default () => spatialDataFactory;
