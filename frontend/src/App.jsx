import React from 'react'
import {
  createBrowserRouter,
  Route,
  createRoutesFromElements,
  RouterProvider,
} from "react-router"
import Home from './pages/Home';
import './connection'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
        <Route index element={<Home />} />
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