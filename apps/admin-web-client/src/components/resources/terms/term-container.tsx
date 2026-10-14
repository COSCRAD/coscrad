import { useParams } from 'react-router-dom';
import { PageContentLayout } from '../../shared/page-content-layout';
import { NotesAboutTerm } from './notes-about-term';
import { TermDetail } from './term-detail.page';

export const TermContainer = (): JSX.Element => {
    const { id } = useParams();

    return (
        <PageContentLayout>
            <TermDetail id={id} />
            <NotesAboutTerm termId={id} />
        </PageContentLayout>
    );
};
