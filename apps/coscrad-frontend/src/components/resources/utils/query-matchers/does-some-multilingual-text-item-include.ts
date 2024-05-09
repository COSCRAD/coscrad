import { IMultilingualText } from '@coscrad/api-interfaces';

export const doesSomeMultilingualTextItemInclude = (
    multilingualText: IMultilingualText,
    query: string
) => multilingualText.items.some(({ text }) => text.toLowerCase().includes(query.toLowerCase()));
