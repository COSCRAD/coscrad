import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../../domain/common';
import {
    DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN,
    IDigitalTextQueryRepository,
} from '../../../../digital-text/queries/digital-text-query-repository.interface';
import { DigitalRepresentationOfBibliographicCitationRegistered } from './digital-representation-of-bibliographic-citation-registered.event';

export class DigitalRepresentationOfBibliographicCitationRegisteredEventHandler
    implements ICoscradEventHandler
{
    constructor(
        /**
         * TODO At some point, we will introduce a query repository for bibliographic
         * citations in order to optimze their queries. At this point, we should
         * update this handler (or introduce another handler) to update the
         * view document in `bibliographicCitation__VIEWS` to have a reference
         * to the `digitalRepresentation` as a `ResourceCompositeIdentifier`.
         */
        // bibliographicCitationRepository,
        @Inject(DIGITAL_TEXT_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly digitalTextQueryRepository: IDigitalTextQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: citationId },
            digitalRepresentationResourceCompositeIdentifier,
        },
    }: DigitalRepresentationOfBibliographicCitationRegistered): Promise<void> {
        if (digitalRepresentationResourceCompositeIdentifier.type === ResourceType.digitalText) {
            await this.digitalTextQueryRepository.registerCitation(
                digitalRepresentationResourceCompositeIdentifier.id,
                citationId
            );
        }
    }
}
