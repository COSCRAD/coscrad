import { DomainModelCtor } from '../../../../lib/types/DomainModelCtor';
import { IGeometricFeature } from '../../../models/spatial-feature/interfaces/geometric-feature.interface';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';

const geometricFeatureTypeToGeometryClass: {
    [K in GeometricFeatureType]: DomainModelCtor<IGeometricFeature>;
} = {
    [GeometricFeatureType.line]: 
}
