import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { BrandClientContextProvider } from 'components/Providers/BrandClientContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <BrandClientContextProvider>
        <App />
      </BrandClientContextProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
