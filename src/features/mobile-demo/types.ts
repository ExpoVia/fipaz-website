export type CategoryId = "technology" | "health" | "finance" | "gastronomy" | "education" | "startups";
export interface Category { id: CategoryId; label: string; iconName: string }
export interface Zone { id: string; name: string; shortCode: string; categoryIds: CategoryId[]; buildingName: string }
export interface Stand {
  id: string; name: string; category: CategoryId; description: string; zoneId: string;
  planId: string; boothCode: string; tags: string[]; activity?: string; promotion?: string;
  points: number; featured?: boolean;
}
export interface Mission {
  id: string; title: string; shortDescription: string; category: CategoryId | "general";
  standIds?: string[]; target: number; rewardPoints: number; featured?: boolean; unlockedBy?: string;
}
export interface Reward { id: string; title: string; description: string; cost: number; stockLabel: string }
export type View = "home" | "map" | "scan" | "missions" | "profile" | "stands" | "qr" | "rewards" | "event" | "stand" | "receipt";
export interface Screen { view: View; id?: string }
