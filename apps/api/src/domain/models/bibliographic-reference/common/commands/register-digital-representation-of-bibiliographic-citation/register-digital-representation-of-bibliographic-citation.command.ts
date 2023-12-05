import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { FullReference, NestedDataType } from '@coscrad/data-types';
import { DigitalTextCompositeId } from '../../../../digital-text/commands';
import { BibliographicReferenceCompositeIdentifier } from '../../../shared/BibliographicReferenceCompositeIdentifier';

@Command({
    type: `REGISTER_DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION`,
    label: `Add Digital Content for Citation`,
    description: `Register a Digital Text as the subject of a Bibliographic Citation`,
})
export class RegisterDigitalRepresentationOfBibliographicCitation implements ICommandBase {
    @NestedDataType(BibliographicReferenceCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system wide unique ID',
    })
    readonly aggregateCompositeIdentifier: BibliographicReferenceCompositeIdentifier;

    /**
     * TODO, Ideally we would tag this as a `ReferenceTo` but with a full
     * composite identifier.
     *
     * TODO In the future, this could use any resource type. At that point, the
     * correlation between resource type and bibliographic citation type should
     * become an invariant validation rule.
     */
    @NestedDataType(DigitalTextCompositeId, {
        label: 'digital representation resource composite identifier',
        description: 'ID for the resource that is the digital representation of this citation',
    })
    @FullReference()
    readonly digitalRepresentationResourceCompositeIdentifier: DigitalTextCompositeId;
}
