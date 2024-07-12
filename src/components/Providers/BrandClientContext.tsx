import { BrandClient } from 'client/BrandClient';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import developmentSettings from 'development-settings.json';

// Define the shape of the context state
interface BrandClientContextState {
  client: BrandClient;
}

// Create the context with a default value
const BrandClientContext = createContext<BrandClientContextState | undefined>(undefined);

interface BrandClientContextProviderProps {
    children: ReactNode;
}
  
export const BrandClientContextProvider: React.FC<BrandClientContextProviderProps> = ({ children }) => {
    const [client, _] = useState<BrandClient>(new BrandClient(developmentSettings.gateway));

    return (
        <BrandClientContext.Provider value={{ client }}>
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
  