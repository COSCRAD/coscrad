import { AggregateType, ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { CREATE_TERM } from './constants';

export class TermCompositeIdentifier {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */

    @NonEmptyString({
        label: 'type',
        description: 'song',
    })
    type = AggregateType.term;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: CREATE_TERM,
    label: 'Create Term',
    description: 'Create a new term in the language',
})
export class CreateTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'composite ID (generated)',
        description: 'system-wide unique identifier for the new term',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NonEmptyString({
        label: 'text',
        description: 'text for the term (in the language)',
    })
    text: string;

    /**
     * In the future, we may want to have a per-tenant configuration that
     * allows us to contstrain this to be in the indigenous language for the
     * given tenant. That is the intended use-case. There is a separate
     * command for creating an English prompt term to later be translated via a
     * word collection process.
     */
    @NonEmptyString({
        label: 'language',
        description: 'the language of this term',
    })
    languageCode: LanguageCode;

    /**
     * TODO We really want this to be part of the event metadata. We also need
     * a model for contributors.
     */
    @NonEmptyString({
        label: 'contributor ID',
        description: 'The ID of the knowledge keeper who contributed the term',
    })
    contributorId: string;
}
