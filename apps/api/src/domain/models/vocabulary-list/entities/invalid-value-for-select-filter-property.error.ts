import { InternalError } from '../../../../lib/errors/InternalError';
import { ValueAndDisplay } from './value-and-display.entity';

export class InvalidValueForSelectFilterPropertyError extends InternalError {
    constructor({ value, display: display }: ValueAndDisplay<unknown>, name: string) {
        const msg = `You cannot add the value: ${value} (${display}) as the value of the select vocabulary list filter property ${name}.. Only string values are permitted for select filters.`;

        super(msg);
    }
}
