import {BrowserRouter as Router, Route, Routes} from 'react-router-dom' 
import Login from './pages/login'
import AdminHome from './pages/admin'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/admin/home' element={<AdminHome/>}/>
        {/* <Route path='/home' element={<Home/>}/>    */}
      </Routes>
    </Router>
  )
}

export default App