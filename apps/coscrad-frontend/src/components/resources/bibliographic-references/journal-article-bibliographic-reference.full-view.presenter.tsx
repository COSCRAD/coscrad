import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    IValueAndDisplay,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';

export const JournalArticleBibliographicReferenceFullViewPresenter = ({
    id,
    data: { title, abstract, issueDate, publicationTitle, url, issn, doi },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [issueDate, 'Date'],
            [publicationTitle, 'Publication'],
            // TODO format as link
            [url, 'External Link'],
            [issn, 'ISSN'],
            [doi, 'DOI'],
            // TODO expose creators
        ] as const
    )
        // Do not present optional values
        .filter(([value, _]) => value !== null && typeof value !== 'undefined')
        .map(([value, display]) => ({
            value,
            display,
        }));

    return (
        <Card>
            <CardHeader title="Journal Article Bibliographic Reference"></CardHeader>
            <CardContent>
                <div data-testid={id}>
                    {title}
                    <Divider />
                    <br />
                    {labelsAndValues
                        .filter(({ value }) => value !== null && typeof value !== 'undefined')
                        .map((valueAndDisplay) => (
                            <SinglePropertyPresenter {...valueAndDisplay} />
                        ))}
                </div>
            </CardContent>
        </Card>
    );
};
