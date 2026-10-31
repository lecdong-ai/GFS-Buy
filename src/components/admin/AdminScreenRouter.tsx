'use client';

import React from 'react';
import { TabItem } from '@/types/erp';
import { UserRegView } from './screens/UserRegView';
import { UserPermMgmtView } from './screens/UserPermMgmtView';
import { ChangeRequestView } from './screens/ChangeRequestView';
import { SystemUsageView } from './screens/SystemUsageView';
import { ErpWorkspace } from '../common/ErpWorkspace';

interface AdminScreenRouterProps {
  tab: TabItem;
}

export const AdminScreenRouter: React.FC<AdminScreenRouterProps> = ({ tab }) => {
  switch (tab.menuId) {
    case 'admin-user-reg':
    case 'admin-user-edit':
      return <UserRegView />;
    case 'admin-perm-mgmt':
      return <UserPermMgmtView />;
    case 'admin-request-edit':
    case 'admin-change-request':
      return <ChangeRequestView />;
    case 'admin-system-log':
    case 'admin-system-usage':
      return <SystemUsageView />;
    default:
      return <ErpWorkspace tab={tab} />;
  }
};

