import {
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    NestedDataType,
    NonEmptyString,
    TypeDecoratorOptions,
} from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import { DTO } from '../../../types/DTO';
import { DeepPartial } from '../../../types/DeepPartial';
import { ResultOrError } from '../../../types/ResultOrError';
import { Valid } from '../../domainModelValidators/Valid';
import { DuplicateLanguageInMultilingualTextError } from '../../models/audio-visual/audio-item/errors/duplicate-language-in-multilingual-text.error';
import { MultilingualTextHasNoOriginalError } from '../../models/audio-visual/audio-item/errors/multilingual-text-has-no-original.error';
import { MultipleOriginalsInMultilingualTextError } from '../../models/audio-visual/shared/transcript-errors/multiple-originals-in-multilingual-text.error';
import BaseDomainModel from '../../models/base-domain-model.entity';
import {
    isNull,
    isNullOrUndefined,
    isUndefined,
} from '../../utilities/validation/is-null-or-undefined';
import { CannotAddDuplicateTranslationError } from './errors';

export { MultilingualTextItemRole };

export const LanguageCodeEnum = (options: TypeDecoratorOptions) =>
    ExternalEnum(
        {
            enumLabel: `language code`,
            enumName: `LanguageCode`,
            labelsAndValues: Object.entries(LanguageCode).map(([label, languageCode]) => ({
                label,
                value: languageCode,
            })),
        },
        options
    );

export class MultilingualTextItem extends BaseDomainModel implements IMultilingualTextItem {
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

    toString(): string {
        // TODO we need to use labels for the enums here
        return `${this.text} {${this.languageCode}} (role: ${this.role})`;
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

        return this.items.map((item) => item.toString()).join('\n');
    }

    hasTranslation(): boolean {
        return this.items.length > 1;
    }

    getTranslationLanguages(): LanguageCode[] {
        return this.items.flatMap(
            // We use flatmap so we can filter and build without a full reduce or two loops.
            (item) => (item.role === MultilingualTextItemRole.original ? [] : [item.languageCode])
        );
    }

    has(languageCode: LanguageCode): boolean {
        const searchResult = this.items.find((item) => item.languageCode === languageCode);

        return !isNullOrUndefined(searchResult);
    }

    getTranslation(languageCode: LanguageCode): Maybe<MultilingualTextItem> {
        return this.items.find((item) => item.languageCode === languageCode) || NotFound;
    }

    getOriginalTextItem(): MultilingualTextItem {
        return this.items.find(({ role }) => role === MultilingualTextItemRole.original).clone();
    }

    translate(itemDto: DTO<MultilingualTextItem>): ResultOrError<this> {
        const item = new MultilingualTextItem(itemDto);

        if (this.has(item.languageCode)) return new CannotAddDuplicateTranslationError(item, this);

        // TODO make this return an error if there is a conflict with existing items
        return this.clone({
            // avoid shared references
            items: this.items.concat(item).map((item) => new MultilingualTextItem(item)),
        } as DeepPartial<DTO<this>>);
    }

    validateComplexInvariants(): ResultOrError<Valid> {
        const allErrors: InternalError[] = [];

        /**
         * We can't validate complex invariants if the simple invariants (data types)
         * are off. Maybe we should skip the call to `validateComplexInvariants`
         * in that case?
         */
        if (!Array.isArray(this.items)) return;

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
