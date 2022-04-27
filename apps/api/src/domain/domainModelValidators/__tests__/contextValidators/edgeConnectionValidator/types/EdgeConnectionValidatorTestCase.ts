import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { EdgeConnection } from '../../../../../models/context/edge-connection.entity';

// We alias here in case we want to go a different direction in the future

export type EdgeConnectionValidatorInvalidTestCase = {
    description?: string;
    /**
     * Actually, this is unknown, but it's usually one-step away from a valid
     * model, so the type inference is helpful. Casting an invalid DTO
     * in the test case builder is probably the lesser evil.
     */
    invalidDTO: DTO<EdgeConnection>;
    expectedError: InternalError;
};

export type EdgeConnectionValidatorTestCase = {
    validCases: {
        description?: string;
        dto: DTO<EdgeConnection>;
    }[];
    invalidCases: EdgeConnectionValidatorInvalidTestCase[];
};
