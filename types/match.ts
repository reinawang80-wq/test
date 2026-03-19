export interface LifePlan {
  year: number;
  title: string;
}

export interface Match {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  matchScore: number;
  matchReason: string;
  tags: string[];
  lifePlans: LifePlan[];
}