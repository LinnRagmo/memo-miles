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
  type: 'drive' | 'activity' | 'stop';
  notes?: string;
  coordinates?: [number, number];
}

export interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  days: TripDay[];
}
