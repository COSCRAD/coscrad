import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../types/DTO';
import BaseDomainModel from '../../models/BaseDomainModel';

/**
 * There are several ways we can arrive at multiple translations of a
 * term, starting with an
 * - original
 * - gloss the original term in the context of a larger text
 * - translate to a target (typically indigenous) language based on a prompt (typically in the colonial language)
 * - freely translate a word, phrase, sentence, or larger text from the original to the target language
 * - literally (word for word) translate a passage of text from the original to the target language
 *
 * Within our system, we will encounter all of these situations. It is
 * important to capture this information in the database from the point of
 * view of linguistic integrity of the data collected. At a practical level,
 * this distinction helps us avoid misleading learners who take "translations"
 * between languages too literally.
 */
export enum MultiLingualTextItemRole {
    original = 'original',
    glossedTo = 'glossed to',
    prompt = 'prompt', // e.g., "How do you say?"
    freeTranslation = 'free translation',
    literalTranslation = 'literal translation',
}

export class MultiLingualTextItem extends BaseDomainModel {
    @NonEmptyString({
        label: 'language code',
        description: 'an official identifier of the language',
    })
    readonly languageId: string;

    @NonEmptyString({
        label: 'text',
        description: 'plain text in the given language',
    })
    readonly text: string;

    @ExternalEnum(
        {
            labelsAndValues: Object.values(MultiLingualTextItemRole).map((label) => ({
                value: label,
                label,
            })),
            enumLabel: 'text item role', // text significance?
            // Single source of truth, but is this going too far?
            enumName: Object.getPrototypeOf(MultiLingualTextItemRole).name,
        },
        {
            description: 'role of this text in the translation process',
            label: 'text item role',
        }
    )
    readonly role: MultiLingualTextItemRole;

    // TODO Support (user defined) dialects of the same language - would tags be the better way to do this?
    // @NonEmptyString({
    //     label: 'dialect',
    //     description: 'an informal identifier of the dialect of the given language',
    //     isOptional: true,
    // })
    // readonly dialect?: string;

    constructor(dto: DTO<MultiLingualTextItem>) {
        super();

        if (!dto) return;

        const { languageId, role, text } = dto;

        this.languageId = languageId;

        this.role = role;

        this.text = text;
    }
}

export class MultiLingualText extends BaseDomainModel {
    @NestedDataType(MultiLingualTextItem, {
        label: 'items',
        description: 'one item for each provided language',
        isArray: true,
    })
    readonly items: MultiLingualTextItem[];

    constructor(dto: DTO<MultiLingualText>) {
        super();

        if (!dto) return;

        const { items } = dto;

        this.items = Array.isArray(items)
            ? items.map((item) => new MultiLingualTextItem(item))
            : null;
    }

    toString(): string {
        return this.items.map(({ text, languageId }) => `{${languageId}}: ${text}`).join('\n');
    }
}
