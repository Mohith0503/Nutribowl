import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Menu } from '../pages/Menu';
import { About } from '../pages/About';
import { Subscriptions } from '../pages/Subscriptions';
import { MySubscriptions } from '../pages/MySubscriptions';
import { Admin } from '../pages/Admin';
import { MealDetails } from '../pages/MealDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'menu',
        element: <Menu />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'subscriptions',
        element: <Subscriptions />,
      },
      {
        path: 'my-subscriptions',
        element: <MySubscriptions />,
      },
      {
        path: 'meal/:id',
        element: <MealDetails />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: '/admin',
    element: <Admin />,
  }
]);

