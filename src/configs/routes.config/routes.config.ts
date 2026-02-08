import { lazy } from 'react'
import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'services',
        path: '/services',
        component: lazy(() => import('@/views/services')),
        authority: [],
    },
    {
        key: 'cart',
        path: '/cart',
        component: lazy(() => import('@/views/cart')),
        authority: [],
    },
    {
        key: 'quote',
        path: '/quote',
        component: lazy(() => import('@/views/quote')),
        authority: [],
    },
    {
        key: 'workers',
        path: '/workers',
        component: lazy(() => import('@/views/workers')),
        authority: [],
    },
    {
        key: 'about',
        path: '/about',
        component: lazy(() => import('@/views/about')),
        authority: [],
    },
    {
        key: 'contact',
        path: '/contact',
        component: lazy(() => import('@/views/contact')),
        authority: [],
    },
    {
        key: 'feedback',
        path: '/feedback',
        component: lazy(() => import('@/views/feedback')),
        authority: [],
    },
    {
        key: 'enterprise',
        path: '/enterprise',
        component: lazy(() => import('@/views/enterprise')),
        authority: [],
    },
    {
        key: 'admin',
        path: '/admin',
        component: lazy(() => import('@/views/admin')),
        authority: [],
    },
    {
        key: 'adminSettings',
        path: '/admin/settings',
        component: lazy(() => import('@/views/admin/AdminSettings')),
        authority: ['admin'],
    },
    {
        key: 'adminClients',
        path: '/admin/clients',
        component: lazy(() => import('@/views/admin/ClientManagement')),
        authority: ['admin'],
    },
    {
        key: 'inventory',
        path: '/inventory',
        component: lazy(() => import('@/views/inventory')),
        authority: [],
    },
]
