import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Home.jsx';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import MainWall from './mainWall.jsx';
import Profile from './Profile.jsx';
import Admin from './Admin.jsx';
import SharedDraft from './SharedDraft.jsx';
import EditSharedDraft from './EditSharedDraft.jsx';
import AuthViewDraft from './AuthViewDraft.jsx';
import AuthEditDraft from './AuthEditDraft.jsx';
import Subscriptions from './subscriptions.jsx';
import MailVerification from './MailVerification';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import PlanFeatures from './PlanFeatures';
import { PlanProvider } from './PlanContext';

export default function App(){
  return (
    <PlanProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/mainWall" element={<MainWall />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/shared/:shareId" element={<SharedDraft />} />
        <Route path="/edit-shared/:editId" element={<EditSharedDraft />} />
        <Route path="/auth-view/:viewId" element={<AuthViewDraft />} />
        <Route path="/auth-edit/:editId" element={<AuthEditDraft />} />
        <Route path="/subscriptions" element={<Subscriptions open={true} isPage={true} />} />
        <Route path="/mailverification" element={<MailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/plan-features/:planId" element={<PlanFeatures />} />
      </Routes>
    </Router>
    </PlanProvider>
  );
}
