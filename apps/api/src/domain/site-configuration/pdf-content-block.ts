import { NonEmptyString, URL } from '@coscrad/data-types';

// Not sure which if any properties are optional

export class PdfContentBlock {
    @NonEmptyString({
        label: 'name',
        description: 'name of the PDF document',
    })
    title: string;

    @NonEmptyString({
        label: 'description',
        description: 'description for the PDF document',
    })
    description: string;

    @URL({
        label: 'url',
        description: 'url for the PDF media',
    })
    url: string;
}
