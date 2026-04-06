import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentManagement from './pages/student/StudentManagement';
import GuardianManagement from './pages/guardian/GuardianManagement';
import EmployeeManagement from './pages/Employee/EmployeeManagement';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login'; // Your new import!
import ProtectedRoute from './components/ProtectedRoute'; 

// We create a wrapper component to handle the layout logic
const AppLayout = () => {
  const location = useLocation();
  
  // Check if we are currently on the login page
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex h-screen bg-white">
      {/* 1. Only show the Sidebar if we are NOT on the login page */}
      {!isLoginPage && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 2. Only show the Navbar if we are NOT on the login page */}
        {!isLoginPage && <Navbar />}
        
        {/* 3. Remove the padding/background if it's the login page so it goes full screen */}
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${!isLoginPage ? 'bg-sky-100 p-6 rounded-lg' : ''}`}>
          <Routes>
            {/* PUBLIC ROUTE */}
            <Route path="/login" element={<Login />} />

            {/* PRIVATE ROUTES (Wrapped in the Bouncer) */}
            <Route path="/" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
              
            } />
            <Route path="/student" element={
              <ProtectedRoute><StudentManagement/></ProtectedRoute>
            } />
            <Route path="/guardian" element={
              <ProtectedRoute><GuardianManagement /></ProtectedRoute>
            } />
            <Route path='/employee' element={
              <ProtectedRoute><EmployeeManagement/></ProtectedRoute>
            } />
            <Route path="/users" element={ <ProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL']}> <UserManagement /> </ProtectedRoute> } />
            
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* We have to put our layout inside BrowserRouter so it can read the URL */}
      <AppLayout /> 
    </BrowserRouter>
  );
}

export default App;