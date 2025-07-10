import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Home from './Home.jsx';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import MainWall from './mainWall.jsx';
import Profile from './Profile.jsx';

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/mainWall" element={<MainWall />} />
        <Route path="/Profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}
