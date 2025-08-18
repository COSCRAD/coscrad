import { InternalError } from '../../../../lib/errors/InternalError';

export class InsufficientNumberOfCardsForPublicationError extends InternalError {
    constructor(roundSize: number, actualNumberOfCards: number) {
        super(
            `${roundSize} memory match cards are required for publication but only ${actualNumberOfCards} have been provided.`
        );
    }
}
