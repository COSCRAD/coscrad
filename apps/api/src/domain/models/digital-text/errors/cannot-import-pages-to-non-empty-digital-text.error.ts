import { InternalError } from '../../../../lib/errors/InternalError';
import DigitalTextPage from '../entities/digital-text-page.entity';

export class CannotImportPagesToNonEmptyDigitalTextError extends InternalError {
    constructor(existingPages: DigitalTextPage[]) {
        const msg = `Failed to import pages, as the digital text already has ${existingPages.length} pages`;

        super(msg);
    }
}
