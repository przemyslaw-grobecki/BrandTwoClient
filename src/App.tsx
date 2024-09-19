import { useBrandClientContext } from 'components/Providers/BrandClientContext';
import AdminPanel from 'pages/AdminPanel';
import DeviceConfiguration from 'pages/DeviceConfigurationPage';
import AcquisitionConfigurationPage from 'pages/AcquisitionConfigurationPage';
import RealTimeChartPage from 'pages/RealTimeChartPage';

import LoadingScreen from 'pages/LoadingPage';
import SignInPage from 'pages/SignInPage';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import SignUpPage from 'pages/SignupPage';
import StoredChartPage from 'pages/StoredChartPage';

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
        <Route path="/signup" element={!isAuthenticated ? <SignUpPage /> : <Navigate to="/home" />} /> 
        <Route path="/" element={<Navigate to={isAuthenticated ? "/home" : "/signin"} />} />
        <Route path="/home" element={isAuthenticated ? <AdminPanel /> : <Navigate to="/signin" />} />
        <Route path="/device-configuration/:deviceId" element={isAuthenticated ? <DeviceConfiguration /> : <Navigate to="/signin" />} />
        <Route path="/acquisition-configuration/:deviceId"  element={isAuthenticated ? <AcquisitionConfigurationPage /> : <Navigate to="/signin" />} />
        <Route path="/experiment/:experimentId/charts" element={isAuthenticated ? <RealTimeChartPageWrapper/> : <Navigate to= "/signin" />} />
        <Route path="/experiment/:experimentId/storedCharts" element={isAuthenticated ? <StoredChartPageWrapper/> : <Navigate to="/signin"/>}/>
      </Routes>
    </div>
  );
}

const RealTimeChartPageWrapper: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  return <RealTimeChartPage experimentId={experimentId!} />;
};

const StoredChartPageWrapper: React.FC = () => {
  const { experimentId } = useParams<{ experimentId: string }>();
  return <StoredChartPage experimentId={experimentId!} />;
};

export default App;
