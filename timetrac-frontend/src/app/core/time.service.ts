/**
 * TimeService - Time Tracking API Service
 * 
 * This service provides a clean, typed interface for all time tracking
 * operations. It wraps HTTP calls to the backend API and provides
 * reactive observables for seamless integration with Angular components.
 * 
 * Key Features:
 * - Type-safe API interactions with TypeScript interfaces
 * - Reactive programming with RxJS Observables
 * - Comprehensive CRUD operations for time entries
 * - Support for location tracking and photo attachments
 * - Automatic authentication via HTTP interceptors
 * 
 * Architecture:
 * - Injectable service with root-level provider
 * - Uses Angular HttpClient for API communication
 * - Environment-based API endpoint configuration
 * - Clean separation of concerns from UI components
 * 
 * @author Abud Development Team
 * @version 1.0.0
 * @since 2025-09-10
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

/**
 * TimeEntry Interface - Time Tracking Entry Data Structure
 * 
 * This interface defines the complete structure of a time tracking entry
 * as returned by the backend API. It matches the Buffalo model structure
 * and provides type safety for all time tracking operations.
 * 
 * Fields:
 * - id: Unique identifier for the time entry
 * - project: Project name or category
 * - tags: Array of tag strings for categorization
 * - note: Free-form text note
 * - color: Hex color code for UI theming
 * - location_lat: GPS latitude coordinate (optional)
 * - location_lng: GPS longitude coordinate (optional)
 * - location_addr: Human-readable address (optional)
 * - photo_data: Base64 encoded photo data (optional)
 * - start_at: Time tracking start timestamp (ISO string)
 * - end_at: Time tracking end timestamp (null while running)
 * - created_at: Entry creation timestamp
 * - updated_at: Last modification timestamp
 */
export interface TimeEntry {
  id: string;                    // Unique entry identifier
  project: string;               // Project name or category
  tags: string[];                // Array of tag strings
  note: string;                  // Free-form text note
  color: string;                 // Hex color code for UI
  location_lat?: number | null;  // GPS latitude (optional)
  location_lng?: number | null;  // GPS longitude (optional)
  location_addr?: string | null; // Human-readable address (optional)
  photo_data?: string | null;    // Base64 encoded photo (optional)
  start_at: string;              // ISO string from backend
  end_at?: string | null;        // null/undefined while running
  created_at: string;            // Entry creation timestamp
  updated_at: string;            // Last modification timestamp
}

/**
 * TimeService Class - Time Tracking API Service Implementation
 * 
 * Injectable service that provides methods for all time tracking operations.
 * Uses Angular's HttpClient for API communication and returns RxJS Observables
 * for reactive programming patterns.
 */
@Injectable({ providedIn: 'root' })
export class TimeService {
  /**
   * Base API URL for time tracking endpoints
   * Constructed from environment configuration
   */
  private base = `${environment.API_BASE}/api/tracks`;
  
  /**
   * Injected HttpClient instance for API communication
   * Automatically includes authentication headers via interceptors
   */
  private http = inject(HttpClient);

  /**
   * Retrieves all time tracking entries for the authenticated user
   * 
   * GET /api/tracks/
   * 
   * This method fetches the complete list of time tracking entries
   * for the currently authenticated user, ordered by creation date.
   * 
   * @returns Observable<TimeEntry[]> - Array of time tracking entries
   */
  list(): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.base}/`);
  }

  /**
   * Starts a new time tracking entry
   * 
   * POST /api/tracks/start
   * 
   * This method creates a new time tracking entry with the provided data
   * and immediately starts the timer. All fields are optional except
   * for the automatic timestamp generation.
   * 
   * @param data - Time entry data including project, tags, location, etc.
   * @returns Observable<TimeEntry> - The created time entry
   */
  start(data: {
    project?: string;           // Project name or category
    tags?: string[];           // Array of tag strings
    note?: string;             // Free-form text note
    color?: string;            // Hex color code for UI
    location_lat?: number;     // GPS latitude coordinate
    location_lng?: number;     // GPS longitude coordinate
    location_addr?: string;    // Human-readable address
    photo_data?: string;       // Base64 encoded photo data
  }): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/start`, data);
  }

  /**
   * Stops a running time tracking entry
   * 
   * POST /api/tracks/stop
   * 
   * This method stops either the currently running entry or a specific
   * entry by ID. If no ID is provided, it stops the most recent
   * running entry for the user.
   * 
   * @param id - Optional specific entry ID to stop
   * @returns Observable<TimeEntry> - The updated time entry
   */
  stop(id?: string): Observable<TimeEntry> {
    return this.http.post<TimeEntry>(`${this.base}/stop`, id ? { id } : {});
  }

  /**
   * Updates an existing time tracking entry
   * 
   * PATCH /api/tracks/{id}
   * 
   * This method allows partial updates to an existing time entry.
   * Only the provided fields will be updated, leaving others unchanged.
   * 
   * @param id - Unique identifier of the entry to update
   * @param patch - Partial TimeEntry object with fields to update
   * @returns Observable<TimeEntry> - The updated time entry
   */
  update(id: string, patch: Partial<TimeEntry>): Observable<TimeEntry> {
    return this.http.patch<TimeEntry>(`${this.base}/${id}`, patch);
  }

  /**
   * Permanently removes a time tracking entry
   * 
   * DELETE /api/tracks/{id}
   * 
   * This method permanently deletes a time tracking entry from the database.
   * The operation is irreversible and only affects entries owned by the user.
   * 
   * @param id - Unique identifier of the entry to delete
   * @returns Observable<{ status: string }> - Confirmation of deletion
   */
  remove(id: string): Observable<{ status: string }> {
    return this.http.delete<{ status: string }>(`${this.base}/${id}`);
  }
}
