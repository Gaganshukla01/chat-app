import React, { useEffect } from "react";
import {Loader} from "lucide-react"
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import { useAuthStore } from "./store/useAuthStore.js";
import {Routes,Route, Navigate} from "react-router-dom"
import {Toaster} from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore.js";



const App = () => {

  const {authUser,checkAuth,isCheckingAuth} = useAuthStore()
  const {theme}=useThemeStore()

  useEffect(()=>{
    checkAuth()
   
  },[checkAuth])
   
  if(isCheckingAuth && !authUser)return(
    <div className="flex items-center  justify-center h-screen">
    <Loader clasName="size-10 animate-spin"/>
  </div>
  )

 
  return (
    <>
    <div data-theme={theme} className="h-full">
      <Navbar />
      <Routes>
        <Route path="/" element={authUser ?<HomePage />:<Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser?<SignUpPage/>:<Navigate to="/"/>} />
        <Route path="/login" element={!authUser?<LoginPage/>:<Navigate to="/"/>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ?<ProfilePage />:<Navigate to="/login"/>} />
      </Routes>

      <Toaster
      position="bottom-center"
      reverseOrder={false}
      />
      </div>
    </>
  );
};

export default App;
