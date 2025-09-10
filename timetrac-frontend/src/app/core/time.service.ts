// TimeService wraps HTTP calls to the time tracking API.
// It provides typed helpers to list/start/stop/update/remove entries.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/** Matches your Buffalo model (timetrac table) */
export interface TimeEntry {
  id: string;
  project: string;
  tags: string[];
  note: string;
  color: string;
  start_at: string;            // ISO string from backend
  end_at?: string | null;      // null/undefined while running
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class TimeService {
  private base = `${environment.API_BASE}/api/tracks`;
  private http = inject(HttpClient);

  /** GET /api/tracks/ — list latest entries for the logged-in user */
  list(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.base}/`);
  }

  /** POST /api/tracks/start — starts a new running entry */
  start(data: {
    project?: string;
    tags?: string[];
    note?: string;
    color?: string;
  }): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/start`, data);
  }

  /**
   * POST /api/tracks/stop — stops the running entry.
   * If you pass an id, it stops that specific entry.
   */
  stop(id?: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/stop`, id ? { id } : {});
  }

  /** PATCH /api/tracks/{id} — update fields (project/tags/note/color) */
  update(id: string, patch: Partial<TimeEntry>): Observable<TimeEntry> {
    return this.http.patch<TimeEntry>(`${this.base}/${id}`, patch);
  }

  /** DELETE /api/tracks/{id} — remove an entry you own */
  remove(id: string): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${this.base}/${id}`);
  }
}
