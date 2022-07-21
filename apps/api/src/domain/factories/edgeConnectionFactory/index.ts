import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { isValid } from '../../domainModelValidators/Valid';
import { EdgeConnection } from '../../models/context/edge-connection.entity';

export default (dto: DTO<EdgeConnection>): ResultOrError<EdgeConnection> => {
    const validationResult = validateEdgeConnection(dto);

    if (!isValid(validationResult)) return validationResult;

    return new EdgeConnection(dto);
};
