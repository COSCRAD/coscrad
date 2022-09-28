export const consolidateMessagesForErrors = (errors: Error[]): string =>
    errors.map((error) => error.toString()).join('\n');
