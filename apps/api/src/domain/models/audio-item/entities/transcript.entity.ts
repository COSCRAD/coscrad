import { NestedDataType } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { isValid } from '../../../domainModelValidators/Valid';
import BaseDomainModel from '../../BaseDomainModel';
import {
    ConflictingLineItemsError,
    DuplicateTranscriptParticipantError,
    DuplicateTranscriptParticipantInitialsError,
    DuplicateTranscriptParticipantNameError,
} from '../errors';
import { CannotAddInconsistentLineItemError } from '../errors/transcript-line-item/cannot-add-inconsistent-line-item.error';
import { TranscriptParticipantInitialsNotRegisteredError } from '../errors/transcript-participant-initials-not-registered.error';
import { TranscriptItem } from './transcript-item.entity';
import { TranscriptParticipant } from './transcript-participant';

export class Transcript extends BaseDomainModel {
    // TODO Validate that there are not duplicate IDs here
    @NestedDataType(TranscriptParticipant, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'participants',
        description: 'a list of participants and their initials',
    })
    participants: TranscriptParticipant[];

    @NestedDataType(TranscriptItem, {
        isArray: true,
        // i.e. can be empty
        isOptional: true,
        label: 'items',
        description: 'time stamps with text and speaker labels',
    })
    // TODO rename this, as it includes the data as well
    items: TranscriptItem[];

    // Should we configure allowed languages at the top level?

    constructor(dto: DTO<Transcript>) {
        super();

        if (!dto) return;

        const { items, participants } = dto;

        if (Array.isArray(participants))
            this.participants = participants.map((p) => new TranscriptParticipant(p));

        if (Array.isArray(items)) this.items = items.map((item) => new TranscriptItem(item));
    }

    /**
     * TODO Every entity (even nested entities that are not the aggregate root)
     * should be able to validate its own invariants. This would allow us
     * to call `safeClone` on any `DomainModel`.
     *
     * For now, "simple invariants" (i.e. generalized type rules) are
     * checked in the domain model factories. But complex invariant validation
     * must be done on the aggregate root (`AudioItem` in this case).
     */
    addParticipant(participant: TranscriptParticipant): ResultOrError<this> {
        const allErrors: InternalError[] = [];

        // TODO validate that name initials are unique
        const { initials, name } = participant;

        const searchByInitialsResult = this.findParticipantByInitials(initials);

        // TODO avoid double negative
        // Is there already a participant with these initials?
        if (!isNotFound(searchByInitialsResult))
            allErrors.push(new DuplicateTranscriptParticipantInitialsError(initials));

        const searchByNameResult = this.findParticipantByName(name);

        // TODO avoid double negative
        // Is there already a participant with these initials?
        if (!isNotFound(searchByNameResult))
            allErrors.push(new DuplicateTranscriptParticipantNameError(name));

        return allErrors.length === 0
            ? this.clone({
                  // avoid shared references by cloning
                  participants: this.participants.concat(participant.clone()),
              } as DeepPartial<DTO<this>>)
            : new DuplicateTranscriptParticipantError(allErrors);
    }

    findParticipantByInitials(initials: string): Maybe<TranscriptParticipant> {
        return (
            this.participants.find((participant) => participant.initials === initials) || NotFound
        );
    }

    findParticipantByName(name: string): Maybe<TranscriptParticipant> {
        return this.participants.find((participant) => participant.name === name) || NotFound;
    }

    addLineItem(item: TranscriptItem): ResultOrError<this> {
        const lineItemErrors = this.validateLineItem(item);

        if (lineItemErrors.length > 0)
            return new CannotAddInconsistentLineItemError(item, lineItemErrors);

        // Avoid shared references to individual items by cloning
        const newItems = this.items.concat(item.clone());

        return this.clone({
            items: newItems,
        } as DeepPartial<DTO<this>>);
    }

    private getConflictingItems({
        inPoint,
        outPoint,
    }: Pick<TranscriptItem, 'inPoint' | 'outPoint'>): TranscriptItem[] {
        return this.items.filter((item) => item.conflictsWith({ inPoint, outPoint }));
    }

    private validateLineItem(newLineItem: TranscriptItem): InternalError[] {
        const allErrors: InternalError[] = [];

        const itemValidationResult = newLineItem.validateInvariants();

        if (!isValid(itemValidationResult)) allErrors.push(itemValidationResult);

        const conflictingExistingItems = this.getConflictingItems(newLineItem);

        if (conflictingExistingItems.length > 0)
            allErrors.push(new ConflictingLineItemsError(newLineItem, conflictingExistingItems));

        const { speakerInitials } = newLineItem;

        const participantSearchResult = this.findParticipantByInitials(speakerInitials);

        if (isNotFound(participantSearchResult))
            allErrors.push(new TranscriptParticipantInitialsNotRegisteredError(speakerInitials));

        return allErrors;
    }
}
