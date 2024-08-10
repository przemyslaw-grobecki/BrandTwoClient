import { BrandClientContextProvider, useBrandClientContext } from 'components/Providers/BrandClientContext'
import AdminPanel from 'pages/AdminPanel'
import SignInPage from 'pages/SignInPage'
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const { client, brandClientTokenInfo } = useBrandClientContext();

  return (
    <div>
        <Routes>
          <Route path="/signin" element={!client.IsClientAuthenticated(brandClientTokenInfo) ? <SignInPage/> : <Navigate to="/home"/>}/>
          <Route path="/" element={<Navigate to="/signin"/>}/>
          <Route path="/home" element={client.IsClientAuthenticated(brandClientTokenInfo) ? <AdminPanel/> : <Navigate to="/signin"/>}/>
          {/* <Route path="/*" element={<AdminPanel/>}/> */}
        </Routes>
    </div>
  )
}

export default App
