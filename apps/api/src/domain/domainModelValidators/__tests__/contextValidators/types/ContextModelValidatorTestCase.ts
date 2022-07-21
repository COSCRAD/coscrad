import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { EdgeConnectionContextType } from '../../../../models/context/types/EdgeConnectionContextType';
import { DomainModelValidator } from '../../../types/DomainModelValidator';

// We alias here in case we want to go a different direction in the future

export type ContextModelValidatorInvalidTestCase<TContextModel> = {
    description?: string;
    /**
     * Actually, this is unknown, but it's usually one-step away from a valid
     * model, so the type inference is helpful. Casting an invalid DTO
     * in the test case builder is probably the lesser evil.
     */
    invalidDTO: DTO<TContextModel>;
    expectedError: InternalError;
};

export type ContextModelValidatorTestCase<TContextModel> = {
    contextType: EdgeConnectionContextType; // TODO correlate this with TContextModel
    validator: DomainModelValidator;
    validCases: {
        description?: string;
        dto: DTO<TContextModel>;
    }[];
    invalidCases: ContextModelValidatorInvalidTestCase<TContextModel>[];
};
