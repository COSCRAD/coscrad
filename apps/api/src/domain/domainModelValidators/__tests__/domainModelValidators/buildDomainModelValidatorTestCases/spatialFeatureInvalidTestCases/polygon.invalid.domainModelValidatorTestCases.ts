import { Polygon } from '../../../../../models/spatial-feature/polygon.entity';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';

export const buildPolygonInvalidTestCases =
    /**
     * TODO [test-coverage] Once we add non-trivial invariant validation rules,
     * we should add test coverage here
     */
    (): DomainModelValidatorInvalidTestCase<Polygon>[] => [];
