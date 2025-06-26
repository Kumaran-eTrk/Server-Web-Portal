/* eslint-disable @typescript-eslint/no-explicit-any */

import {  Navigate, Outlet, Route, Routes, useSearchParams } from 'react-router-dom'
import './App.css'
import Layout from './components/layout'
import Dashboard from './components/pages/dashboard'
import Loginpage from './components/pages/loginpage'
import { FluentProvider, teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme, tokens } from '@fluentui/react-components'
import ForgotPassword from './components/modules/loginpage/components/ForgotPassword'
import Teaminfo from './components/pages/teaminfo'
import SystemConsole from './components/pages/systemconsole'

import PluginInfo from './components/pages/plugins'
import Adminconsole from './components/pages/adminconsole'
import UserCompliances from './components/modules/plugins/components/usercomplaince'

function App() {

  const PrivateRoute = () => {
    const auth = localStorage.getItem("username");  
    return auth ? <Outlet /> : <Navigate to="/" />
    }

    const SecurityRoute = () => {
      const [searchParams] = useSearchParams();
      const token = searchParams.get("q");
      return token ? <Outlet /> : <Navigate to="/" />;
    };

  const themeString: string = '';
  return (
  
   
    <FluentProvider theme={
      themeString === "dark"
        ? teamsDarkTheme
        : themeString === "contrast"
        ? teamsHighContrastTheme
        : {
            ...teamsLightTheme,
            colorNeutralBackground3: "#eeeeee",
          }
    }
    style={{ background: tokens.colorNeutralBackground3 }}>
  <Routes>
    <Route path="/" element={<Loginpage />} />
    <Route path="/dashboard" element={<PrivateRoute/>} >
    <Route path="/dashboard" element={<Layout />}>
      <Route index element={<Dashboard />} />
    </Route>
    </Route>
    <Route path="/Teaminfo" element={<PrivateRoute/>} >
    <Route path="/Teaminfo" element={<Layout />} >
      <Route index element={<Teaminfo/>}/>
      </Route>
      </Route>
     
      <Route path="/adminconsole" element={<PrivateRoute/>} >
    <Route path="/adminconsole" element={<Layout />} >
      <Route index element={<Adminconsole/>}/>
      </Route>
      </Route>

      <Route path="/plugininfo" element={<PrivateRoute/>} >
    <Route path="/plugininfo" element={<Layout />} >
      <Route index element={<PluginInfo/>}/>
      </Route>
      </Route>

      <Route path="/usercomplaince" element={<PrivateRoute/>} >
    <Route path="/usercomplaince" element={<Layout />} >
      <Route index element={<UserCompliances/>}/>
      </Route>
      </Route>

      
      <Route path="/systemconsole" element={<PrivateRoute/>} >
    <Route path="/systemconsole" element={<Layout />} >
      <Route index element={<SystemConsole/>}/>
      </Route>
      </Route>

      <Route path="/resetpassword" element={<SecurityRoute />}>
          <Route path="/resetpassword">
            <Route index element={<ForgotPassword />} />
          </Route>
        </Route>
     
  </Routes>
</FluentProvider>

  
  
  

  )
}

export default App
