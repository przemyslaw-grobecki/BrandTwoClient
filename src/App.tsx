import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import AdminPanel from 'pages/AdminPanel';
import DeviceConfiguration from 'pages/DeviceConfigurationPage';
import LoadingScreen from 'pages/LoadingPage';
import SignInPage from 'pages/SignInPage';
import { Navigate, Route, Routes } from 'react-router-dom';

function App() {
  const { client, brandClientTokenInfo, loading } = useBrandClientContext();

  const isAuthenticated = client.IsClientAuthenticated(brandClientTokenInfo);

  if (loading) {
    return <LoadingScreen />; // Or a loading spinner
  }

  return (
    <div>
      <Routes>
        <Route path="/signin" element={!isAuthenticated ? <SignInPage /> : <Navigate to="/home" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/signin"} />} />
        <Route path="/home" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/signin" />} />
        <Route path="/device-configuration/:deviceId" element={isAuthenticated ? <DeviceConfiguration /> : <Navigate to="/signin" />} />
      </Routes>
    </div>
  );
}

export default App;
