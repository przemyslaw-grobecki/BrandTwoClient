import { BrandClientContextProvider } from 'components/Providers/BrandClientContext'
import AdminPanel from 'pages/AdminPanel'
import SignInPage from 'pages/SignInPage'
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <BrandClientContextProvider>
        <Routes>
          <Route path="/signin" element={<AdminPanel/>}/>
          <Route path="/" element={<Navigate to="/signin"/>}/>
          {/* <Route path="/*" element={<Navigate to="/signin" />}/> */}
        </Routes>
      </BrandClientContextProvider>
    </div>
  )
}

export default App
