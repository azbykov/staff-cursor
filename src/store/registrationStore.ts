import { create } from 'zustand';
import { CompanySize, IndustryType } from '@prisma/client';

interface RegistrationState {
  // Данные компании (Шаг 1)
  companyData: {
    name: string;
    industry: IndustryType | '';
    size: CompanySize | '';
    phone?: string;
  };
  // Данные пользователя (Шаг 2)
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
  // Методы
  setCompanyData: (data: Partial<RegistrationState['companyData']>) => void;
  setUserData: (data: Partial<RegistrationState['userData']>) => void;
  reset: () => void;
}

const initialState = {
  companyData: {
    name: '',
    industry: '',
    size: '',
    phone: '',
  },
  userData: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  },
};

export const useRegistrationStore = create<RegistrationState>((set) => ({
  ...initialState,
  setCompanyData: (data) =>
    set((state) => ({
      companyData: { ...state.companyData, ...data },
    })),
  setUserData: (data) =>
    set((state) => ({
      userData: { ...state.userData, ...data },
    })),
  reset: () => set(initialState),
})); 