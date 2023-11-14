import { InternalError } from '../../../../lib/errors/InternalError';
import { ValueAndDisplay } from './value-and-display.entity';

export class InvalidValueForCheckboxFilterPropertyError extends InternalError {
    constructor({ value, display }: ValueAndDisplay<unknown>, name: string) {
        const msg = `You cannot add the value: ${value} (${display}) as the value of the checkbox vocabulary list filter property ${name}.. The only values that are permitted for checkbox filters are true or false.`;

        super(msg);
    }
}
