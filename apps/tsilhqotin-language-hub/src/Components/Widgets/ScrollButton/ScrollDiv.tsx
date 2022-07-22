import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

const ScrollToDiv = () => {
    const goToDiv = () => {
        window.scrollTo({
            top: 720,
            behavior: 'smooth',
        });
    };
    return (
        <div className="top-to-div">
            {' '}
            {
                <KeyboardDoubleArrowDownIcon
                    className="icon2-position icon-style"
                    onClick={goToDiv}
                />
            }{' '}
        </div>
    );
};
export default ScrollToDiv;
