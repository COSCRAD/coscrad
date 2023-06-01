import { Union2Member } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { DTO } from '../../../../types/DTO';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EMPTY_DTO_INJECTION_TOKEN } from '../free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@Union2Member(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.textField)
export class TextFieldContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.textField;

    // This is the key (field name) of the target text property on the model
    readonly target: string;

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
    readonly charRange: [number, number];

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<TextFieldContext>) {
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
