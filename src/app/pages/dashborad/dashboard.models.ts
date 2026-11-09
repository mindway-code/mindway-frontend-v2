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
}

export interface RoleDashboardConfig {
  icon: string;
  searchPlaceholder: string;
  summaryLabel: string;
  summaryDescription: string;
  listEyebrow: string;
  listTitle: string;
  listDescription: string;
  emptyTitle: string;
  emptyDescription: string;
  childActionLabel: string;
  childActionRoute: string;
}
