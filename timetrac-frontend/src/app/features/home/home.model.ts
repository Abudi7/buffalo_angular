export interface TimeEntry {
    id: string;                // uuid in real API
    project: string;           // project / tag
    notes?: string;            // optional notes
    startAt: string;           // ISO string
    endAt?: string;            // ISO string (if running, undefined)
    durationMinutes: number;   // cached duration for quick display
    date: string;              // YYYY-MM-DD (for grouping)
  }
  