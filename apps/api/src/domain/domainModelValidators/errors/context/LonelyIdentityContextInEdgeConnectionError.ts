import { InternalError } from '../../../../lib/errors/InternalError';

export default class LonelyIdentityContextInEdgeconnectionError extends InternalError {
    constructor() {
        super(
            `The identity context cannot apply to one (but not the other) member in an edge connection`
        );
    }
}
