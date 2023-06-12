import {
    FixedValue,
    NonEmptyString,
    NonNegativeFiniteNumber,
    UnionMember,
} from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../constants';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.textField)
export class TextFieldContext extends EdgeConnectionContext {
    @FixedValue(
        // EdgeConnectionType.textField,
        {
            label: 'context type',
            description: 'text field',
        }
    )
    readonly type = EdgeConnectionContextType.textField;

    // This is the key (field name) of the target text property on the model
    @NonEmptyString({
        label: 'target property',
        description:
            'the text-valued property that provides the context for this note or connection',
    })
    readonly target: string;

    // given that all text is to be Multilingual text, do we need a `langaugeCode` property here as well?

    /**
     * The range of characters to use for the context.
     *
     * TODO [design] How should we represent the entire string as context?
     * We'll worry about this when we hit the use case
     * Ideas:
     * - Use [o,model[target].length], where model[target] is the value of the
     * target string property on the associated model for the entire text field
     * to be used as context.
     *     - Con- you need to update this if the string length is updated
     * - Have a symbol \ constant string 'entire'
     * - Make this property optional
     *     - Cons- bad practice. It's better to have a symbol or special string
     *        constant so you are certain \ acting with intent.
     *  - Have a separate context type for this case
     */
    /**
     * TODO: We either need to introduce a `CharRange` data class and leverage it
     * as an @NestedType(...) here, or Introduce some kind of `Tuple` decorator
     * or metadata option. Note the latter would sidestep the type issues our
     * DTO helper type has.
     */
    @NonNegativeFiniteNumber({
        isArray: true,
        label: 'character range',
        description:
            'specifies a range of characters in a text that are relevant to a note or connection',
    })
    readonly charRange: [number, number];

    constructor(dto: DTO<TextFieldContext>) {
        super();

        if (!dto) return;

        const { target, charRange } = dto;

        this.target = target;

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182005586]
         * Remove this cast.
         */
        this.charRange = [...(charRange as [number, number])];
    }
}
