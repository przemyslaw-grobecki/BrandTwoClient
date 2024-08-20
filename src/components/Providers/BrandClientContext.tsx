import { BrandClient } from 'client/BrandClient';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import developmentSettings from 'development-settings.json';
import { BrandClientTokenInfo } from 'client/BrandClientConnectionInfo';
import LoadingScreen from 'pages/LoadingPage';

// Define the shape of the context state
interface BrandClientContextState {
  client: BrandClient;
  brandClientTokenInfo: BrandClientTokenInfo | undefined;
  setBrandClientTokenInfo: React.Dispatch<React.SetStateAction<BrandClientTokenInfo | undefined>>;
  loading: boolean;
}

// Create the context with a default value
const BrandClientContext = createContext<BrandClientContextState | undefined>(undefined);

interface BrandClientContextProviderProps {
  children: ReactNode;
}

export const BrandClientContextProvider: React.FC<BrandClientContextProviderProps> = ({ children }) => {
  const client = new BrandClient(developmentSettings.gateway);
  const [brandClientTokenInfo, setBrandClientTokenInfo] = useState<BrandClientTokenInfo | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('brandClientTokenInfo');
    if (storedToken) {
      setBrandClientTokenInfo(JSON.parse(storedToken));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (brandClientTokenInfo) {
      localStorage.setItem('brandClientTokenInfo', JSON.stringify(brandClientTokenInfo));
    } else {
      localStorage.removeItem('brandClientTokenInfo');
    }
  }, [brandClientTokenInfo]);

  if (loading) {
    return <LoadingScreen />; // Or a loading spinner
  }

  return (
    <BrandClientContext.Provider value={{ client, brandClientTokenInfo, setBrandClientTokenInfo, loading }}>
      {children}
    </BrandClientContext.Provider>
  );
};

export const useBrandClientContext = (): BrandClientContextState => {
  const context = useContext(BrandClientContext);
  if (!context) {
    throw new Error('useBrandClientContext must be used within a BrandClientContextProvider');
  }
  return context;
};
