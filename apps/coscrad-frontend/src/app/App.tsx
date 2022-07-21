import { Route, Routes } from "react-router-dom";
import About from '../components/About/About';
import AllEntities from '../components/AllEntities/AllEntities';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='About' element={<About />} />
        <Route path='AllEntities' element={<AllEntities />} />
        <Route path='MembersOnly' element={<MembersOnly />}/>
      </Routes>
    </div>
  );
}

export default App;
