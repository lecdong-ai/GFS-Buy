'use client';

import React from 'react';
import { TabItem } from '@/types/erp';
import { WarehouseMoveView } from './screens/WarehouseMoveView';
import { MatExtraIssueRegView } from './screens/MatExtraIssueRegView';
import { StocktakeExpiryView } from './screens/StocktakeExpiryView';
import { RawMatStocktakeView } from './screens/RawMatStocktakeView';
import { SafetyStockMgmtView } from './screens/SafetyStockMgmtView';
import { ExpiryDiscardMgmtView } from './screens/ExpiryDiscardMgmtView';
import { DiscardStatusGsrView } from './screens/DiscardStatusGsrView';
import { FoodWasteStatusView } from './screens/FoodWasteStatusView';
import { MatExtraIssueStatusView } from './screens/MatExtraIssueStatusView';
import { MatLedgerView } from './screens/MatLedgerView';
import { DailyStockAmountView } from './screens/DailyStockAmountView';
import { CustomerStockStatusView } from './screens/CustomerStockStatusView';
import { ReturnRegView } from './screens/ReturnRegView';
import { ReturnStatusView } from './screens/ReturnStatusView';
import { DiscontinuedStatusView } from './screens/DiscontinuedStatusView';
import { UnusedAssignRegView } from './screens/UnusedAssignRegView';
import { UnusedAssignStatusView } from './screens/UnusedAssignStatusView';
import { UnusedUseRegView } from './screens/UnusedUseRegView';
import { UnusedUseMatStatusView } from './screens/UnusedUseMatStatusView';
import { UnusedUsePurposeStatusView } from './screens/UnusedUsePurposeStatusView';
import { StockLookupView } from '../master/screens/StockLookupView';
import { ErpWorkspace } from '../common/ErpWorkspace';

interface InventoryScreenRouterProps {
  tab: TabItem;
}

export const InventoryScreenRouter: React.FC<InventoryScreenRouterProps> = ({ tab }) => {
  switch (tab.menuId) {
    case 'inv-lookup':
      return <StockLookupView />;
    case 'inv-warehouse-move':
      return <WarehouseMoveView />;
    case 'inv-mat-extra-issue-reg':
      return <MatExtraIssueRegView />;
    case 'inv-stocktake-expiry':
      return <StocktakeExpiryView />;
    case 'inv-raw-mat-stocktake':
      return <RawMatStocktakeView />;
    case 'inv-safety-stock-mgmt':
      return <SafetyStockMgmtView />;
    case 'inv-expiry-discard-mgmt':
      return <ExpiryDiscardMgmtView />;
    case 'inv-unused-assign-reg':
      return <UnusedAssignRegView />;
    case 'inv-unused-assign-status':
      return <UnusedAssignStatusView />;
    case 'inv-unused-use-reg':
      return <UnusedUseRegView />;
    case 'inv-unused-use-mat-status':
      return <UnusedUseMatStatusView />;
    case 'inv-unused-use-purpose-status':
      return <UnusedUsePurposeStatusView />;
    case 'inv-discard-status':
      return <DiscardStatusGsrView />;
    case 'inv-food-waste-status':
      return <FoodWasteStatusView />;
    case 'inv-mat-extra-issue-status':
      return <MatExtraIssueStatusView />;
    case 'inv-mat-ledger':
      return <MatLedgerView />;
    case 'inv-daily-stock-amount':
      return <DailyStockAmountView />;
    case 'inv-customer-stock-status':
      return <CustomerStockStatusView />;
    case 'inv-return-reg':
      return <ReturnRegView />;
    case 'inv-return-status':
      return <ReturnStatusView />;
    case 'inv-discontinued-status':
      return <DiscontinuedStatusView />;
    default:
      return <ErpWorkspace tab={tab} />;
  }
};
