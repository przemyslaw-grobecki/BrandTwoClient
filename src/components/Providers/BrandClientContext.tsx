import { BrandClient } from 'client/BrandClient';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import developmentSettings from 'development-settings.json';
import { BrandClientTokenInfo } from 'client/BrandClientConnectionInfo';

// Define the shape of the context state
interface BrandClientContextState {
  client: BrandClient;
  brandClientTokenInfo: BrandClientTokenInfo | undefined
  setBrandClientTokenInfo: React.Dispatch<React.SetStateAction<BrandClientTokenInfo | undefined>>
}

// Create the context with a default value
const BrandClientContext = createContext<BrandClientContextState | undefined>(undefined);

interface BrandClientContextProviderProps {
    children: ReactNode;
}
  
export const BrandClientContextProvider: React.FC<BrandClientContextProviderProps> = ({ children }) => {
    const client = new BrandClient(developmentSettings.gateway);
    const [brandClientTokenInfo, setBrandClientTokenInfo] = useState<BrandClientTokenInfo | undefined>(undefined);

    return (
        <BrandClientContext.Provider value={{ client, brandClientTokenInfo, setBrandClientTokenInfo }}>
            {children}
        </BrandClientContext.Provider>
    );
};

export const useBrandClientContext = (): BrandClientContextState => {
    const context = useContext(BrandClientContext);
    if (!context) {
      throw new Error('useMyContext must be used within a MyProvider');
    }
    return context;
};
  