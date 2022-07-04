import { DTO } from '../../../../types/DTO';
import spatialFeatureValidator from '../../../domainModelValidators/spatialFeatureValidator';
import { isValid } from '../../../domainModelValidators/Valid';
import { ISpatialFeature } from '../../../models/spatial-feature/ISpatialFeature';
import { InstanceFactory } from '../../getInstanceFactoryForResource';
import buildSpatialFeatureModel from './buildSpatialFeatureModel';

const spatialDataFactory: InstanceFactory<ISpatialFeature> = (dto: unknown) => {
    const validationResult = spatialFeatureValidator(dto);

    // Return error if the dto does not satisfy domain model invariants
    if (!isValid(validationResult)) return validationResult;

    return buildSpatialFeatureModel(dto as DTO<ISpatialFeature>);
};

export default () => spatialDataFactory;
