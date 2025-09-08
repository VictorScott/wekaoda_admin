import { HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

const ROOT_DASHBOARDS = '/dashboard'

const path = (root, item) => `${root}${item}`;

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: '/dashboard',
    title: 'Dashboard',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
    childs: [
        {
            id: 'dashboards.home',
            path: path(ROOT_DASHBOARDS, '/home'),
            type: NAV_TYPE_ITEM,
            title: 'Home',
            transKey: 'nav.dashboards.home',
            Icon: HomeIcon,
        },
        {
            id: 'dashboards.businesses',
            path: path(ROOT_DASHBOARDS, '/businesses'),
            type: NAV_TYPE_ITEM,
            title: 'Businesses',
            transKey: 'nav.dashboards.businesses',
            Icon: HomeIcon,
        },
        {
            id: 'dashboards.users',
            path: path(ROOT_DASHBOARDS, '/users'),
            type: NAV_TYPE_ITEM,
            title: 'Users',
            transKey: 'nav.dashboards.users',
            Icon: UsersIcon,
        },
    ]
}
