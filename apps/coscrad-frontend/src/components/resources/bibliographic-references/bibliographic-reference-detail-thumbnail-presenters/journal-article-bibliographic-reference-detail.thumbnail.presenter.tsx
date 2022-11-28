import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
import { Abstract } from './abstract';

export const JournalArticleBibliographicReferenceThumbnailPresenter = ({
    id,
    data: { title, abstract, issueDate, publicationTitle },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    return (
        <Card>
            <CardHeader title="Journal Article Bibliographic Reference"></CardHeader>
            <CardContent>
                <div data-testid={id}>
                    {title}
                    <br />
                    {publicationTitle} ({issueDate})
                    <Divider />
                    <br />
                    {typeof abstract !== 'undefined' && abstract !== null && (
                        <Abstract abstract={abstract} />
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
