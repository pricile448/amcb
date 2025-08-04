/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
  // Ajoutez d'autres variables d'environnement ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Types pour les comptes
interface Account {
  id: string;
  userId?: string;
  name?: string;
  accountNumber: string;
  accountType?: string;
  balance: number;
  currency: string;
  status: string;
  createdAt?: any;
  bankName?: string;
  iban?: string;
  bic?: string;
  rib?: {
    displayValue: string;
    status: string;
  };
}

// Types pour les comptes Firebase
interface FirebaseAccount {
  id: string;
  userId?: string;
  name?: string;
  accountNumber: string;
  accountType?: string;
  balance: number;
  currency: string;
  status: string;
  createdAt?: any;
  bankName?: string;
  iban?: string;
  bic?: string;
  rib?: {
    displayValue: string;
    status: string;
  };
} 