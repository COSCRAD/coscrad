import { DTO } from '../../../../types/DTO';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

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

    constructor({ target, charRange }: DTO<TextFieldContext>) {
        super();

        this.target = target;

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182005586]
         * Remove this cast.
         */
        this.charRange = [...(charRange as [number, number])];
    }
}
