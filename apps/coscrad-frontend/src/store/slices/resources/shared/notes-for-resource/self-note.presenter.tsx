import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';

export const SelfNotePresenter = ({ text, id, context }: SelfConnectionNote): JSX.Element => (
    <div data-testid={id}>
        {/* TODO Use property presenter helper after rebasing */}
        <strong>Note ({id}):</strong>
        <p>{text}</p>
        <br />
        {/* TODO Eventually we should offer a way to highlight this context in the detail view */}
        {/* We may not need to present this here in this way. This is for development only. */}
        <strong>Context</strong>
        {JSON.stringify(context)}
        <br />
    </div>
);
