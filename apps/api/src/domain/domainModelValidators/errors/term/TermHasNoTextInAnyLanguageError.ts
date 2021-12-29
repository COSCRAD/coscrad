import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class TermHasNoTextInAnyLanguageError extends InternalError {
  constructor(termId?: string) {
    const message = [
      termId ? `The term with ID ${termId}` : ``,
      `has no text in either language`,
    ].join(' ');

    super(message);
  }
}
