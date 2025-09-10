// HomePage renders the timer controls and the latest time entries list.
// It encapsulates minimal state and delegates persistence to TimeService.
// The component favors clarity over micro-optimizations for maintainability.
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Ionic standalone components
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon, IonTextarea,
  IonList, IonChip, IonSkeletonText, IonSegment, IonSegmentButton,
  IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';

import { FormsModule } from '@angular/forms';
import { TimeService, TimeEntry } from '../../core/time.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon, IonTextarea,
    IonList, IonChip, IonSkeletonText, IonSegment, IonSegmentButton,
    IonRefresher, IonRefresherContent
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  // Header date (avoid new Date() in template)
  today = new Date();

  // Form controls
  projects = ['No project', 'Web', 'Mobile', 'Backend', 'Design'];
  selectedProject = 'No project';
  tags: string[] = [];
  tagInput = '';
  note = '';
  color = '#3b82f6';

  // Data
  entries: TimeEntry[] = [];
  loading = false;

  // Running timer (for top clock only)
  runningEntry: TimeEntry | null = null;
  elapsedMs = 0;

  // Ticks
  private _clockTick?: any;
  private _dateTick?: any;

  private api = inject(TimeService);
  private i18n = inject(I18nService);

  constructor() {}

  // ==== Lifecycle ====
  ngOnInit(): void {
    this.load();
    this._dateTick = setInterval(() => (this.today = new Date()), 60_000);
  }

  ngOnDestroy(): void {
    clearInterval(this._clockTick);
    clearInterval(this._dateTick);
  }

  // ==== API ====
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

  start(): void {
    if (this.runningEntry) return;
    const payload = {
      project: this.selectedProject === 'No project' ? '' : this.selectedProject,
      tags: this.tags,
      note: this.note,
      color: this.color,
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

  // CSV Export
  exportCsv(): void {
    const header = ['id','project','tags','note','color','start_at','end_at','created_at','updated_at'];
    const rows = this.entries.map(e => [
      e.id,
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

  trackById(_: number, e: TimeEntry) { return e.id; }
}
