import {BrowserRouter as Router, Route, Routes} from 'react-router-dom' 
import Login from './pages/login'
import Register from './pages/register'
// import Home from './pages/home'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        {/* <Route path='/home' element={<Home/>}/>    */}
      </Routes>
    </Router>
  )
}

export default App