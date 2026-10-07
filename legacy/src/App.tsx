import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import S1_Top from './pages/S1_Top';
import S2_Sword from './pages/S2_Sword';
import S3_Event from './pages/S3_Event';
import S4_Map from './pages/S4_Map';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<S1_Top />} />
          <Route path="/sword/:id" element={<S2_Sword />} />
          <Route path="/event/:id" element={<S3_Event />} />
          <Route path="/map" element={<S4_Map />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
