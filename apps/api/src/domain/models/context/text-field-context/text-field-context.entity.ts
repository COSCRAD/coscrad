import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class TextFieldContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.textField;

    // This is the key (field name) of the target text property on the model
    readonly target: string;

    /**
     * The range of characters to use for the context. Use [o,s.length] for the
     * entire text field to be used as context.
     */
    readonly charRange: [number, number];

    constructor({ target, charRange }: PartialDTO<TextFieldContext>) {
        super();

        this.target = target;

        // TODO remove cast
        // Avoid side-effects
        this.charRange = [...(charRange as [number, number])];
    }
}
