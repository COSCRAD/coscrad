import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../../context/commands';

export class DigitalReprsentationAlreadyRegisteredForResourceError extends InternalError {
    /**
     *
     * @param digitalRepresentationResourceCompositeIdentifier The composite ID of the resource that is the digital representation of this bibliographic citation
     * @param otherBibliographicCitationId The ID of the bibliographic citation that is already using the given digital representation
     */
    constructor(
        digitalRepresentationResourceCompositeIdentifier: ResourceCompositeIdentifier,
        otherBibliographicCitationId: string
    ) {
        super(
            `${formatAggregateCompositeIdentifier(
                digitalRepresentationResourceCompositeIdentifier
            )} has already been registered as a digital representation for: ${formatAggregateCompositeIdentifier(
                {
                    type: AggregateType.bibliographicCitation,
                    id: otherBibliographicCitationId,
                }
            )}`
        );
    }
}
