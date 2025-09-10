export interface TimeEntryUI {
  id: string;
  project: string;
  tags: string[];
  note: string;
  color: string;
  location_lat?: number | null;
  location_lng?: number | null;
  location_addr?: string | null;
  photo_data?: string | null;
  start_at: string;
  end_at?: string | null;
  created_at: string;
  updated_at: string;
}
  