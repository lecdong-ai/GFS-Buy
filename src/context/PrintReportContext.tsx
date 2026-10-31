'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PrintDocumentType =
  | 'WORK_ORDER'
  | 'HACCP_INSPECTION'
  | 'MATERIAL_LEDGER'
  | 'COST_SHEET'
  | 'DELIVERY_STATEMENT'
  | 'PURCHASE_ORDER'
  | 'LOT_LABEL'
  | 'DELIVERY_BOX_LABEL';

interface PrintReportContextType {
  isPrintModalOpen: boolean;
  activeDocType: PrintDocumentType;
  openPrintModal: (docType?: PrintDocumentType) => void;
  closePrintModal: () => void;
  setActiveDocType: (docType: PrintDocumentType) => void;
}

const PrintReportContext = createContext<PrintReportContextType | null>(null);

export const PrintReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [activeDocType, setActiveDocType] = useState<PrintDocumentType>('WORK_ORDER');

  const openPrintModal = (docType?: PrintDocumentType) => {
    if (docType) {
      setActiveDocType(docType);
    }
    setIsPrintModalOpen(true);
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
  };

  return (
    <PrintReportContext.Provider
      value={{
        isPrintModalOpen,
        activeDocType,
        openPrintModal,
        closePrintModal,
        setActiveDocType,
      }}
    >
      {children}
    </PrintReportContext.Provider>
  );
};

export const usePrintReport = () => {
  const context = useContext(PrintReportContext);
  if (!context) {
    throw new Error('usePrintReport must be used within a PrintReportProvider');
  }
  return context;
};

