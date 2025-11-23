import React from 'react'
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router"
import Home from './pages/Home';
import HomeLayout from './Layout/HomeLayout';
import Layout from './Layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import './connection'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<HomeLayout />} >
        <Route index element={<Home />} />
        </Route>
        <Route path='/dashboard' element={<Layout />} >
        <Route index element={<Dashboard />} />
        </Route>
    </Route>
  )
);

const App = () => {
  return (
    <div className="contain mx-auto font-dmsans text-[16px] text-dark w-full">
       <RouterProvider router={router} />
     </div>
  )
}

export default App