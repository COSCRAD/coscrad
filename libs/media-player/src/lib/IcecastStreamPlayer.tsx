interface IcecastPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

const DEFAULT_LISTEN_MESSAGE = 'Listen Live!';

export const IcecastStreamPlayer = ({ audioUrl, listenMessage }: IcecastPlayerProps) => {
    return (
        <div>
            <audio controls>
                <source src={audioUrl} type="audio/ogg" />
                <source src={audioUrl} type="audio/mpeg" />
            </audio>
        </div>
    );
};
