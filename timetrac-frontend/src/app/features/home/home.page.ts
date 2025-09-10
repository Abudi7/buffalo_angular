/**
 * HomePage Component - Main Time Tracking Interface
 * 
 * This component serves as the primary interface for time tracking functionality.
 * It provides a comprehensive timer control system with project management,
 * location tracking, photo attachments, and time entry management.
 * 
 * Key Features:
 * - Start/stop time tracking with project categorization
 * - Location tracking with GPS coordinates and address
 * - Photo capture and attachment capabilities
 * - Tag-based organization system
 * - Real-time entry list with pull-to-refresh
 * - CSV export functionality
 * - Multi-language support (AR, EN, DE)
 * - Modern responsive UI with animations
 * 
 * Architecture:
 * - Uses Angular standalone components for modularity
 * - Implements dependency injection with inject() function
 * - Delegates data persistence to TimeService
 * - Integrates with Capacitor plugins for native features
 * - Follows reactive programming patterns
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-10
 */
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Ionic standalone components for UI elements
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon, IonTextarea,
  IonList, IonChip, IonSkeletonText, IonSegment, IonSegmentButton,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { TimeService, TimeEntry } from '../../core/time.service';
import { I18nService } from '../../core/i18n.service';

// Capacitor plugins for native device features
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

/**
 * Component decorator configuration
 * 
 * Defines the component metadata including:
 * - Selector for template usage
 * - Standalone component flag for modularity
 * - Required imports for template functionality
 * - Template and style file references
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonSelect, IonSelectOption, IonIcon, IonTextarea,
    IonSegment, IonSegmentButton,
    IonRefresher, IonRefresherContent
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  // ===== COMPONENT STATE =====
  
  /**
   * Current date for header display
   * Cached to avoid repeated Date() calls in template
   */
  today = new Date();

  // ===== FORM CONTROLS =====
  
  /**
   * Available project categories for time tracking
   * Users can select from predefined options or use custom projects
   */
  projects = ['No project', 'Web', 'Mobile', 'Backend', 'Design'];
  
  /**
   * Currently selected project for time tracking
   * Defaults to 'No project' for general time tracking
   */
  selectedProject = 'No project';
  
  /**
   * Array of tags associated with the current time entry
   * Used for categorization and filtering
   */
  tags: string[] = [];
  
  /**
   * Input field value for adding new tags
   * Bound to the tag input field in the template
   */
  tagInput = '';
  
  /**
   * Free-form text note for the current time entry
   * Allows users to add detailed descriptions
   */
  note = '';
  
  /**
   * Hex color code for the current time entry
   * Used for visual theming and organization
   */
  color = '#3b82f6';

  // ===== OPTIONAL FEATURES =====
  
  /**
   * GPS latitude coordinate for location tracking
   * Captured when starting time tracking
   */
  location_lat?: number;
  
  /**
   * GPS longitude coordinate for location tracking
   * Captured when starting time tracking
   */
  location_lng?: number;
  
  /**
   * Human-readable address for location tracking
   * Can be reverse geocoded from GPS coordinates
   */
  location_addr?: string;
  
  /**
   * Base64 encoded photo data for time entry
   * Captured using device camera or file selection
   */
  photo_data?: string;


  // ===== DATA MANAGEMENT =====
  
  /**
   * Array of time tracking entries for display
   * Loaded from the backend via TimeService
   */
  entries: TimeEntry[] = [];
  
  /**
   * Loading state indicator for UI feedback
   * Used to show loading spinners during API calls
   */
  loading = false;

  // ===== TIMER STATE =====
  
  /**
   * Currently running time entry (if any)
   * Used to track active time tracking sessions
   */
  runningEntry: TimeEntry | null = null;
  
  /**
   * Elapsed time in milliseconds for the running entry
   * Updated every second for real-time display
   */
  elapsedMs = 0;

  // ===== INTERVAL MANAGEMENT =====
  
  /**
   * Clock tick interval for updating elapsed time
   * Cleared when component is destroyed
   */
  private _clockTick?: any;
  
  /**
   * Date tick interval for updating header date
   * Cleared when component is destroyed
   */
  private _dateTick?: any;

  // ===== DEPENDENCY INJECTION =====
  
  /**
   * TimeService instance for time tracking operations
   * Handles API communication and data persistence
   */
  private api = inject(TimeService);
  
  /**
   * I18nService instance for internationalization
   * Provides multi-language support (AR, EN, DE)
   */
  private i18n = inject(I18nService);

  /**
   * Component constructor
   * 
   * Initializes the component instance. No complex initialization
   * is performed here as it's handled in ngOnInit().
   */
  constructor() {}

  // ===== LIFECYCLE HOOKS =====
  
  /**
   * Angular lifecycle hook - Component initialization
   * 
   * Called once after the component is initialized. Performs:
   * - Loads existing time entries from the backend
   * - Starts the date tick for header updates every minute
   */
  ngOnInit(): void {
    this.load();
    this._dateTick = setInterval(() => (this.today = new Date()), 60_000);
  }

  /**
   * Angular lifecycle hook - Component cleanup
   * 
   * Called when the component is about to be destroyed. Performs:
   * - Stops the clock tick to prevent memory leaks
   * - Stops the date tick to prevent memory leaks
   */
  ngOnDestroy(): void {
    clearInterval(this._clockTick);
    clearInterval(this._dateTick);
  }

  // ===== API METHODS =====
  
  /**
   * Loads time entries from the backend
   * 
   * This method fetches all time tracking entries for the current user
   * and updates the component state. It can be called with or without
   * a pull-to-refresh event.
   * 
   * @param event - Optional CustomEvent from ion-refresher for pull-to-refresh
   */
  load(event?: CustomEvent): void {
    if (!event) this.loading = true;
    this.api.list().subscribe({
      next: list => {
        this.entries = list;
        this.pickRunning(list);
        if (!event) this.loading = false;
        event?.detail.complete();
      },
      error: () => {
        if (!event) this.loading = false;
        event?.detail.complete();
      }
    });
  }

  /**
   * Gets the current GPS location for time tracking
   * 
   * This method requests location permissions and captures the current
   * GPS coordinates. It uses high accuracy positioning for precise
   * location tracking.
   * 
   * Features:
   * - Requests location permissions before accessing GPS
   * - Uses high accuracy positioning
   * - Gracefully handles permission denials
   * - Stores latitude and longitude coordinates
   * 
   * Note: Address is not reverse geocoded here but could be
   * implemented server-side for better performance.
   */
  async getLocation(): Promise<void> {
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location === 'denied') return;
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      this.location_lat = pos.coords.latitude;
      this.location_lng = pos.coords.longitude;
      // Keep address empty here; could be reverse geocoded server-side later
    } catch {}
  }

  /**
   * Captures or selects a photo for the time entry
   * 
   * This method handles photo capture with intelligent fallback mechanisms:
   * - Detects simulator environments and uses file input
   * - Handles camera permission requests
   * - Provides timeout protection for camera operations
   * - Falls back to file selection on any errors
   * 
   * Environment Detection:
   * - Automatically detects iOS Simulator
   * - Detects web browser environments
   * - Uses appropriate capture method for each environment
   * 
   * Error Handling:
   * - Graceful fallback to file input on camera errors
   * - Permission denial handling
   * - Timeout protection (10 seconds)
   * 
   * @returns Promise that resolves when photo is captured or selection is made
   */
  async addPhoto(): Promise<void> {
    try {
      console.log('Opening camera...');
      
      // Check if we're in a simulator, web environment, or have camera issues
      const isSimulator = window.navigator.userAgent.includes('Simulator') || 
                         window.navigator.userAgent.includes('iPhone Simulator') ||
                         window.navigator.userAgent.includes('iPad Simulator') ||
                         window.navigator.userAgent.includes('iOS Simulator');
      
      const isWeb = !window.navigator.userAgent.includes('Mobile') && 
                   !window.navigator.userAgent.includes('iPhone') && 
                   !window.navigator.userAgent.includes('iPad');
      
      // For simulator or web, use file input directly
      if (isSimulator || isWeb) {
        console.log('Running in simulator/web environment, using file input fallback');
        this.openFileInput();
        return;
      }
      
      // Check if camera is available
      const permissions = await Camera.checkPermissions();
      console.log('Camera permissions:', permissions);
      
      if (permissions.camera === 'denied') {
        console.log('Camera permission denied, requesting...');
        const requestResult = await Camera.requestPermissions();
        console.log('Camera permission request result:', requestResult);
        
        if (requestResult.camera === 'denied') {
          console.error('Camera permission denied by user');
          // Fallback to file input
          this.openFileInput();
          return;
        }
      }
      
      // Try to get photo with timeout
      const img = await Promise.race([
        Camera.getPhoto({
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
          quality: 60,
          allowEditing: false,
          width: 800,
          height: 600,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Camera timeout')), 10000)
        )
      ]) as any;
      
      console.log('Photo captured successfully');
      this.photo_data = img.dataUrl || undefined;
      
      if (this.photo_data) {
        console.log('Photo data saved, length:', this.photo_data.length);
      }
    } catch (error) {
      console.error('Camera error:', error);
      // Always fallback to file input on any error
      this.openFileInput();
    }
  }

  /**
   * Fallback method to open file input for photo selection
   */
  private openFileInput(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Prefer back camera on mobile
    input.style.display = 'none';
    
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.error('Selected file is not an image');
          return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error('Image file is too large (max 10MB)');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.photo_data = e.target.result;
          console.log('Photo loaded from file input successfully');
        };
        reader.onerror = (error) => {
          console.error('Error reading file:', error);
        };
        reader.readAsDataURL(file);
      }
      
      // Clean up
      document.body.removeChild(input);
    };
    
    input.oncancel = () => {
      console.log('File selection cancelled');
      document.body.removeChild(input);
    };
    
    // Add to DOM temporarily
    document.body.appendChild(input);
    input.click();
  }

  /**
   * Clear the current photo data
   */
  clearPhoto(): void {
    this.photo_data = undefined;
    console.log('Photo cleared');
  }

  start(): void {
    if (this.runningEntry) return;
    const payload = {
      project: this.selectedProject === 'No project' ? '' : this.selectedProject,
      tags: this.tags,
      note: this.note,
      color: this.color,
      location_lat: this.location_lat,
      location_lng: this.location_lng,
      location_addr: this.location_addr,
      photo_data: this.photo_data,
    };
    this.api.start(payload).subscribe({
      next: e => {
        this.runningEntry = e;
        this.entries = [e, ...this.entries];
        this.startClock(e.start_at);
      }
    });
  }

  stop(): void {
    if (!this.runningEntry) return;
    const id = this.runningEntry.id;
    this.api.stop(id).subscribe({
      next: e => {
        this.runningEntry = null;
        this.elapsedMs = 0;
        clearInterval(this._clockTick);
        // replace updated item
        this.entries = [e, ...this.entries.filter(x => x.id !== id)];
      }
    });
  }

  // ==== Timer helpers ====
  private pickRunning(list: TimeEntry[]): void {
    const active = list.find(e => !e.end_at);
    this.runningEntry = active ?? null;
    if (active) this.startClock(active.start_at);
    else {
      clearInterval(this._clockTick);
      this.elapsedMs = 0;
    }
  }

  private startClock(startISO: string): void {
    const start = new Date(startISO).getTime();
    clearInterval(this._clockTick);
    this._clockTick = setInterval(() => (this.elapsedMs = Date.now() - start), 500);
  }

  // ==== Display helpers ====
  // Top live clock
  hhmmss(ms: number): string {
    const s = Math.floor(ms / 1000);
    const hh = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  // Translations helper
  t(key: string): string { return this.i18n.t(key); }

  changeLang(l: 'en'|'ar'|'de') { this.i18n.setLang(l); }
  onLangChange(ev: CustomEvent) {
    const val = (ev as any)?.detail?.value as 'en'|'ar'|'de' | undefined;
    if (val) this.changeLang(val);
  }

  // Card durations: only when finished
  isRunning(e: TimeEntry): boolean { return !e.end_at; }

  durationSeconds(e: TimeEntry): number {
    if (!e.end_at) return 0; // running → 0 (don’t live-update here)
    const start = new Date(e.start_at).getTime();
    const end = new Date(e.end_at).getTime();
    return Math.max(0, Math.floor((end - start) / 1000));
  }

  durationPretty(e: TimeEntry): string {
    if (!e.end_at) return 'Running';
    const total = this.durationSeconds(e);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h) return `${h}h ${m}m`;
    if (m) return `${m}m ${s}s`;
    return `${s}s`;
  }

  // Tags
  addTag(): void {
    const value = (this.tagInput || '').trim();
    if (value && !this.tags.includes(value)) this.tags = [...this.tags, value];
    this.tagInput = '';
  }
  removeTag(t: string): void { this.tags = this.tags.filter(x => x !== t); }

  // Photo management - clearPhoto method is defined above

  // CSV Export
  exportCsv(): void {
    const header = ['email','project','tags','note','color','start_at','end_at','created_at','updated_at'];
    const rows = this.entries.map(e => [
      this.userEmail(),
      e.project || '',
      (e.tags || []).join('|'),
      (e.note || '').replace(/\n/g, ' '),
      e.color || '',
      e.start_at,
      e.end_at || '',
      e.created_at,
      e.updated_at,
    ]);
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timetrac-entries-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private userEmail(): string {
    // fallback until we fetch user profile in this component
    try {
      const raw = localStorage.getItem('auth');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.auth?.user?.email || parsed?.user?.email || '';
    } catch {
      return '';
    }
  }


  trackById(_: number, e: TimeEntry) { return e.id; }

  /**
   * Generate Google Maps embed URL for the given coordinates
   */
  getMapUrl(lat: number, lng: number): string {
    // Use OpenStreetMap for reliable display without API key
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;
  }

  /**
   * Open location in native maps app
   */
  async openInMaps(lat: number, lng: number, address?: string): Promise<void> {
    try {
      const label = address || `${lat}, ${lng}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      
      // For mobile devices, try to open in native maps app
      if (window.navigator.userAgent.includes('Mobile')) {
        // Try to open in native maps app first
        const nativeUrl = `maps://maps.google.com/maps?daddr=${lat},${lng}`;
        window.open(nativeUrl, '_blank');
      } else {
        // For desktop, open in new tab
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      // Fallback to web version
      const fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      window.open(fallbackUrl, '_blank');
    }
  }
}
