import { BrandClientContextProvider } from 'components/Providers/BrandClientContext'
import SignInPage from 'pages/SignInPage'
import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <BrandClientContextProvider>
        <Routes>
          <Route path="/signin" element={<SignInPage/>}/>
          <Route path="/*" element={<Navigate to="/signin" />}/>
        </Routes>
      </BrandClientContextProvider>
    </div>
  )
}

export default App
