import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LeadDetails from './pages/LeadDetails';
import Settings from './pages/Settings';
import EventSimulator from './pages/EventSimulator';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads/:id" element={<LeadDetails />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/simulate" element={<EventSimulator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
