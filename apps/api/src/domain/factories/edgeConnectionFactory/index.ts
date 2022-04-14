import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { ResultOrError } from 'apps/api/src/types/ResultOrError';
import edgeConnectionValidator from '../../domainModelValidators/contextValidators/edgeConnectionValidator';
import { isValid } from '../../domainModelValidators/Valid';
import { EdgeConnection } from '../../models/context/edge-connection.entity';

export default (dto: PartialDTO<EdgeConnection>): ResultOrError<EdgeConnection> => {
    const validationResult = edgeConnectionValidator(dto);

    if (!isValid(validationResult)) return validationResult;

    return new EdgeConnection(dto);
};
