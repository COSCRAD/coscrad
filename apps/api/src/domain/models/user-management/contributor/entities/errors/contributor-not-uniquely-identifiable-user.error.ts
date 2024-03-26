import { InternalError } from '../../../../../../lib/errors/InternalError';
import { FullName } from '../../../user/entities/user/full-name.entity';

export class ContributorNotUniquelyIdentifiableUserError extends InternalError {
    constructor(fullName: FullName) {
        const msg = `Contributor: ${fullName.toString()} is not uniquely identifiable. You must specify at least one of "date of birth" and "short bio"`;

        super(msg);
    }
}
