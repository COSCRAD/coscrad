import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './Home.module.css';

export function Home() {
    return (
        <div className="homeScreen">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="home">
                    <div className="Center">
                        <Link to="/terms">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="button" style={style} variant="outlined">
                                    <SearchIcon className="icon" />
                                    Terms
                                </Button>
                            </motion.div>
                        </Link>

                        <Link to="/VocabularyLists">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="button" style={style} variant="outlined">
                                    <SearchIcon />
                                    Paradigms & Vocabulary Lists
                                </Button>
                            </motion.div>
                        </Link>

                        <Link to="/credits">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="button" style={style} variant="outlined">
                                    <InfoOutlinedIcon className="icon" />
                                    Credits
                                </Button>
                            </motion.div>
                        </Link>

                        <div style={{ display: 'column', marginBlock: '10px' }}>
                            <Button style={mobile} variant="outlined">
                                <AndroidIcon />
                                Download for Android
                            </Button>
                            <Button style={mobile} variant="outlined">
                                <AppleIcon />
                                Download for iOS
                            </Button>
                        </div>
                    </div>
                    <div></div>
                </div>
            </motion.div>
        </div>
    );
}

export default Home;

const mobile = {
    color: 'white',
    borderColor: 'white',
    borderRadius: '28px',
    textTransform: 'none',
    paddingBlock: '10px',
    margin: '2.5px',
} as const;

const style = {
    width: 330,
    borderColor: 'rgb(237,0,0)',
    color: 'rgb(237,0,0)',
    height: 70,
    margin: '5px',
    background: 'white',
    borderRadius: '36px',
};
