export interface TripDay {
  id: string;
  date: string;
  drivingTime: string;
  activities: string;
  notes: string;
  stops: Stop[];
  sunrise?: string;
  sunset?: string;
}

export interface Stop {
  id: string;
  time: string;
  location: string;
  type: 'drive' | 'activity' | 'accommodation';
  activityIcon?: 'hiking' | 'food' | 'sightseeing' | 'camera' | 'coffee';
  notes?: string;
  coordinates?: [number, number];
  // For drive type
  startLocation?: string;
  endLocation?: string;
  drivingTime?: string;
  distance?: string;
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
}
