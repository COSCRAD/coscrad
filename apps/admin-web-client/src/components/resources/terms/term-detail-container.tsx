import { useAuth0 } from '@auth0/auth0-react';
import { ResourceType } from '@coscrad/api-interfaces';
import { useParams } from 'react-router-dom';
import { PresentFormWithOptionalGeneratedId } from '../../shared/present-form-with-optional-generated-id';
import { NotesAboutTerm } from './notes-about-term';
import { TermDetail } from './term-detail';
import { TranslateTermForm } from './translate-term-form';

export const TermDetailContainer = (): JSX.Element => {
    const { id } = useParams();

    const { isAuthenticated } = useAuth0();
    return (
        <>
            <TermDetail id={id} />
            {isAuthenticated ? (
                <PresentFormWithOptionalGeneratedId
                    form={TranslateTermForm}
                    context={{
                        resourceId: id,
                        resourceType: ResourceType.term,
                        buttonLabel: 'TRANSLATE TERM',
                    }}
                />
            ) : null}
            <NotesAboutTerm termId={id} />
        </>
    );
};
