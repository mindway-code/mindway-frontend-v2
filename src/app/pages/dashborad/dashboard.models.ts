import type { UserRole } from '../../api/interfaces/user.interface';

export interface DashboardAction {
  icon: string;
  label: string;
  description: string;
  route: string;
}

export interface DashboardTip {
  icon: string;
  title: string;
  description: string;
}

export interface DashboardProfile {
  roleLabel: string;
  eyebrow: string;
  title: string;
  description: string;
  focusTitle: string;
  focusDescription: string;
  primaryActionLabel: string;
  primaryActionRoute: string;
  actions: DashboardAction[];
  tips: DashboardTip[];
}

export interface DashboardViewModel extends DashboardProfile {
  userId: string | null;
  role: UserRole | 'default';
  displayName: string;
  isProfessionalHome: boolean;
  isInstitutionHome: boolean;
}
