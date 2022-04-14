import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EdgeConnection } from '../../../models/context/edge-connection.entity';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import InvalidEdgeConnectionDTOError from '../../errors/context/edgeConnections/InvalidEdgeConnectionDTOError';
import NoteMissingFromEdgeConnectionError from '../../errors/context/edgeConnections/NoteMissingFromEdgeConnectionError';
import NullOrUndefinedEdgeConnectionDTOError from '../../errors/context/edgeConnections/NullOrUndefindEdgeConnectionDTOError';
import { Valid } from '../../Valid';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidEdgeConnectionDTOError(innerErrors);

/**
 * TODO: Should we call this validateEdgeConnection?
 */
export default (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input)) return new NullOrUndefinedEdgeConnectionDTOError();

    const { note } = input as PartialDTO<EdgeConnection>;

    const allErrors = [];

    if (isNullOrUndefined(note)) allErrors.push(new NoteMissingFromEdgeConnectionError());

    return allErrors.length > 0 ? buildTopLevelError(allErrors) : Valid;
};
