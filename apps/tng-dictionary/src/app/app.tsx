import VocabularyListDetail from '../components/VocabularyListDetail/VocabularyListDetail';
import styles from './app.module.css';
import { Routes } from "react-router-dom";
import { Route } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '../components/Home/Home';
import VocabularyListIndex from '../components/VocabularyListIndex/VocabularyListIndex';
import Credits from '../components/Credits/Credits';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Credits" element={<Credits />} />
        <Route path="/vocabularyLists" element={<VocabularyListIndex />} />
        <Route path="/vocabularyLists/:id" element={<VocabularyListDetail />} />
      </Routes>
    </BrowserRouter>


  );
}

export default App;

// TODO ADD HOME, CREDITS, NAVIGATION FROM HOME TO CREDITS & VOCAB INDEX
// 