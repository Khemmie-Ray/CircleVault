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
import CreateSolo from './pages/dashboard/CreateSolo';
import CreateCollective from './pages/dashboard/CreateCollective';
import SoloVault from './pages/dashboard/Savings/SoloVault';
import SoloVaultDetails from './pages/dashboard/Savings/SoloVaultDetails';
import CollectiveDetails from './pages/dashboard/Savings/CollectiveDetails';
import CollectiveVault from './pages/dashboard/Savings/CollectiveVault';
import AllVaults from './pages/dashboard/Savings/AllVaults';
import { ThriftContextProvider } from './context/ThriftContextProvider';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<HomeLayout />} >
        <Route index element={<Home />} />
        </Route>
        <Route path='/dashboard' element={<Layout />} >
        <Route index element={<Dashboard />} />
        <Route path='/dashboard/solo-vault' element={<SoloVault />} />
      <Route path='/dashboard/solo-vault/:id' element={<SoloVaultDetails />} />
      <Route path='/dashboard/solo-vault/create-solo' element={<CreateSolo />} />
      <Route path='/dashboard/collective-vault' element={<CollectiveVault />} />
      <Route path='/dashboard/collective-vault/:id' element={<CollectiveDetails />} />
      <Route path='/dashboard/collective-vault/create-collective' element={<CreateCollective />} />
      <Route path='/dashboard/allVaults' element={<AllVaults />} />
        </Route>
    </Route>
  )
);

const App = () => {
  return (
    <div className="contain mx-auto font-dmsans text-[16px] text-dark w-full">
       <ThriftContextProvider>
         <RouterProvider router={router} />
         </ThriftContextProvider>
     </div>
  )
}

export default App