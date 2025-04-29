interface IcecastPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

const DEFAULT_LISTEN_MESSAGE = 'Listen Live!';

export const IcecastStreamPlayer = ({ audioUrl, listenMessage }: IcecastPlayerProps) => {
    return (
        <div data-testid="icecast-player">
            <audio controls>
                <source src={audioUrl} type="audio/ogg" />
                <source src={audioUrl} type="audio/mpeg" />
            </audio>
            {typeof listenMessage === 'string' && listenMessage.length > 0
                ? listenMessage
                : DEFAULT_LISTEN_MESSAGE}
        </div>
    );
};
