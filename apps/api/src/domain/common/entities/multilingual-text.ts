import {
    IMultilingualText,
    IMultlingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import { Valid } from '../../domainModelValidators/Valid';
import { DuplicateLanguageInMultilingualTextError } from '../../models/audio-item/errors/duplicate-language-in-multilingual-text.error';
import { MultilingualTextHasNoOriginalError } from '../../models/audio-item/errors/multilingual-text-has-no-original.error';
import { MultipleOriginalsInMultilingualTextError } from '../../models/audio-item/errors/multiple-originals-in-multilingual-text.error';
import BaseDomainModel from '../../models/BaseDomainModel';
import { isNull, isUndefined } from '../../utilities/validation/is-null-or-undefined';

export { MultilingualTextItemRole };

export class MultilingualTextItem extends BaseDomainModel implements IMultlingualTextItem {
    @ExternalEnum(
        {
            labelsAndValues: Object.entries(LanguageCode).map(([label, value]) => ({
                label,
                value,
            })),
            enumLabel: 'Language_Code',
            enumName: 'LangaugeCode',
        },
        {
            label: 'language code',
            description: 'an official identifier of the language',
        }
    )
    readonly languageCode: LanguageCode;

    @NonEmptyString({
        label: 'text',
        description: 'plain text in the given language',
    })
    readonly text: string;

    @ExternalEnum(
        {
            labelsAndValues: Object.values(MultilingualTextItemRole).map((label) => ({
                value: label,
                label,
            })),
            enumLabel: 'text item role',
            enumName: 'Multilingual Text Item Role',
        },
        {
            description: 'role of this text in the translation process',
            label: 'text item role',
        }
    )
    readonly role: MultilingualTextItemRole;

    // TODO Support (user defined) dialects of the same language - would tags be the better way to do this?
    // @NonEmptyString({
    //     label: 'dialect',
    //     description: 'an informal identifier of the dialect of the given language',
    //     isOptional: true,
    // })
    // readonly dialect?: string;

    constructor(dto: DTO<MultilingualTextItem>) {
        super();

        if (!dto) return;

        const { languageCode, role, text } = dto;

        this.languageCode = languageCode;

        this.role = role;

        this.text = text;
    }
}

export class MultilingualText extends BaseDomainModel implements IMultilingualText {
    @NestedDataType(MultilingualTextItem, {
        label: 'items',
        description: 'one item for each provided language',
        isArray: true,
    })
    readonly items: MultilingualTextItem[];

    constructor(dto: DTO<MultilingualText>) {
        super();

        if (!dto) return;

        const { items } = dto;

        this.items = Array.isArray(items)
            ? items.map((item) => new MultilingualTextItem(item))
            : null;
    }

    toString(): string {
        /**
         * This is necessary when building error messages in the validation layer.
         */
        if (!Array.isArray(this.items)) {
            if (isNull(this.items)) return 'null';

            if (isUndefined(this.items)) return 'undefined';

            return 'invalid';
        }

        return this.items.map(({ text, languageCode }) => `{${languageCode}}: ${text}`).join('\n');
    }

    validateComplexInvariants(): ResultOrError<Valid> {
        const allErrors: InternalError[] = [];

        const originalTextItems = this.items.filter(
            ({ role }) => role === MultilingualTextItemRole.original
        );

        if (originalTextItems.length > 1)
            allErrors.push(
                new MultipleOriginalsInMultilingualTextError(
                    originalTextItems.map(({ languageCode }) => languageCode)
                )
            );

        if (originalTextItems.length === 0)
            allErrors.push(new MultilingualTextHasNoOriginalError());

        // Initialize a map for counting the items with each language
        const initialItemCountMap = Object.values(LanguageCode).reduce(
            (accMap, languageCode) => accMap.set(languageCode, 0),
            new Map<LanguageCode, number>()
        );

        const countsForEachLanguage = this.items.reduce(
            (accMap, { languageCode }) => accMap.set(languageCode, accMap.get(languageCode) + 1),
            initialItemCountMap
        );

        const languageDuplicationErrors = [...countsForEachLanguage.entries()]
            .filter(([_key, count]) => count > 1)
            .map(([key, _count]) => key)
            .map((key: LanguageCode) => new DuplicateLanguageInMultilingualTextError(key));

        allErrors.push(...languageDuplicationErrors);

        return allErrors.length > 0
            ? new InternalError(`Encountered an instance of invalid multilingual text`, allErrors)
            : Valid;
    }
}
