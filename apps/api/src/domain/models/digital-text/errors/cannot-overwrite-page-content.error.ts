import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { PageIdentifier } from '../entities';

export class CannotOverwritePageContentError extends InternalError {
    constructor(pageIdentifier: PageIdentifier, existingContent: MultilingualText) {
        const msg = `You cannot add content for page: ${pageIdentifier} as it already has the content: ${existingContent.toString()}`;

        super(msg);
    }
}
