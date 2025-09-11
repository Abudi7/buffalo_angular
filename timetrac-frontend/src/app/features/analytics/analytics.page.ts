/**
 * Analytics Page - Data Visualization and Insights
 *
 * This component provides analytics and insights for time tracking data
 * including key metrics, trends, and visualizations.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ionic components
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonGrid, IonRow, IonCol, IonSkeletonText,
  IonDatetime, IonDatetimeButton, IonModal, IonIcon
} from '@ionic/angular/standalone';

import { TimeService, TimeEntry } from '../../core/time.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonGrid, IonRow, IonCol, IonSkeletonText,
    IonDatetime, IonDatetimeButton, IonModal, IonIcon
  ],
  templateUrl: './analytics.page.html',
  styleUrls: ['./analytics.page.scss'],
})
export class AnalyticsPage implements OnInit {
  // ===== COMPONENT STATE =====
  
  /**
   * Loading state for data fetching
   */
  loading = false;
  
  /**
   * Start date for custom date range
   */
  startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  /**
   * End date for custom date range
   */
  endDate = new Date().toISOString();
  
  /**
   * Time entries data
   */
  entries: TimeEntry[] = [];
  
  /**
   * Filtered entries based on date range
   */
  filteredEntries: TimeEntry[] = [];

  // ===== CALCULATED METRICS =====
  
  /**
   * Total hours tracked
   */
  totalHours = 0;
  
  /**
   * Total number of entries
   */
  totalEntries = 0;
  
  /**
   * Average hours per day
   */
  averageHours = 0;
  
  /**
   * Number of active projects
   */
  activeProjects = 0;

  // ===== CHART DATA =====
  
  /**
   * Weekly data for daily tracking chart
   */
  weeklyData: any[] = [];
  
  /**
   * Project data for distribution chart
   */
  projectData: any[] = [];
  
  /**
   * Hourly data for productivity chart
   */
  hourlyData: any[] = [];

  // ===== SERVICES =====
  
  /**
   * TimeService for time tracking operations
   */
  private timeService = inject(TimeService);
  
  /**
   * I18nService for translations
   */
  private i18n = inject(I18nService);

  // ===== LIFECYCLE HOOKS =====
  
  ngOnInit(): void {
    this.loadTimeEntries();
  }

  // ===== DATA LOADING =====
  
  /**
   * Load time entries and calculate metrics
   */
  loadTimeEntries(): void {
    this.loading = true;
    
    this.timeService.list().subscribe({
      next: (entries: TimeEntry[]) => {
        this.entries = entries;
        this.filterEntries();
        this.calculateMetrics();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading time entries:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Filter entries based on date range
   */
  filterEntries(): void {
    const startDate = new Date(this.startDate);
    const endDate = new Date(this.endDate);
    
    this.filteredEntries = this.entries.filter(entry => {
      const entryDate = new Date(entry.start_at);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  /**
   * Calculate key metrics from filtered entries
   */
  calculateMetrics(): void {
    this.totalEntries = this.filteredEntries.length;
    
    // Calculate total hours
    this.totalHours = this.filteredEntries.reduce((total, entry) => {
      if (entry.end_at) {
        const start = new Date(entry.start_at);
        const end = new Date(entry.end_at);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + duration;
      }
      return total;
    }, 0);
    
    // Calculate average hours per day
    const days = Math.max(1, Math.ceil((new Date(this.endDate).getTime() - new Date(this.startDate).getTime()) / (1000 * 60 * 60 * 24)));
    this.averageHours = Math.round((this.totalHours / days) * 10) / 10;
    
    // Calculate active projects
    const uniqueProjects = new Set(this.filteredEntries.map(entry => entry.project || 'No Project'));
    this.activeProjects = uniqueProjects.size;
    
    // Generate chart data
    this.generateWeeklyData();
    this.generateProjectData();
    this.generateHourlyData();
  }

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle start date change
   */
  onStartDateChange(event: any): void {
    this.startDate = event.detail.value as string;
    this.filterEntries();
    this.calculateMetrics();
  }

  /**
   * Handle end date change
   */
  onEndDateChange(event: any): void {
    this.endDate = event.detail.value as string;
    this.filterEntries();
    this.calculateMetrics();
  }

  // ===== CHART METHODS =====
  
  /**
   * Generate weekly data for daily tracking chart
   */
  generateWeeklyData(): void {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    this.weeklyData = days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const dayEntries = this.filteredEntries.filter(entry => {
        const entryDate = new Date(entry.start_at);
        return entryDate.toDateString() === date.toDateString();
      });
      const hours = dayEntries.reduce((sum, entry) => sum + this.calculateDuration(entry), 0);
      return { day, hours: Math.round(hours * 100) / 100 };
    });
  }
  
  /**
   * Generate project data for distribution chart
   */
  generateProjectData(): void {
    const projectMap = new Map<string, number>();
    
    this.filteredEntries.forEach(entry => {
      const project = entry.project || 'No Project';
      const duration = this.calculateDuration(entry);
      projectMap.set(project, (projectMap.get(project) || 0) + duration);
    });
    
    const totalHours = Array.from(projectMap.values()).reduce((sum, hours) => sum + hours, 0);
    
    this.projectData = Array.from(projectMap.entries()).map(([name, hours]) => ({
      name,
      hours: Math.round(hours * 100) / 100,
      percentage: totalHours > 0 ? Math.round((hours / totalHours) * 100) : 0
    })).sort((a, b) => b.hours - a.hours);
  }
  
  /**
   * Generate hourly data for productivity chart
   */
  generateHourlyData(): void {
    const hourlyMap = new Map<number, number>();
    
    this.filteredEntries.forEach(entry => {
      const startTime = new Date(entry.start_at);
      const hour = startTime.getHours();
      const duration = this.calculateDuration(entry);
      hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + duration);
    });
    
    this.hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      value: Math.round((hourlyMap.get(hour) || 0) * 100) / 100
    }));
  }
  
  /**
   * Get bar height percentage for daily chart
   */
  getBarHeight(hours: number): number {
    const maxHours = Math.max(...this.weeklyData.map(d => d.hours));
    return maxHours > 0 ? (hours / maxHours) * 100 : 0;
  }
  
  /**
   * Get bar height percentage for hourly chart
   */
  getHourlyBarHeight(value: number): number {
    const maxValue = Math.max(...this.hourlyData.map(h => h.value));
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }
  
  /**
   * Get project color for charts
   */
  getProjectColor(index: number): string {
    const colors = [
      '#3880ff', '#3dc2ff', '#5260ff', '#7044ff', '#f06292',
      '#ff5722', '#ff9800', '#ffc107', '#4caf50', '#8bc34a'
    ];
    return colors[index % colors.length];
  }
  
  /**
   * Get circular progress background
   */
  getCircularProgress(): string {
    const percentage = Math.min((this.totalHours / 40) * 100, 100);
    return `conic-gradient(#3880ff ${percentage * 3.6}deg, #e0e0e0 0deg)`;
  }
  
  /**
   * Calculate duration between start and end time
   */
  private calculateDuration(entry: TimeEntry): number {
    if (!entry.end_at) return 0;
    const start = new Date(entry.start_at);
    const end = new Date(entry.end_at);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Format duration in hours to readable string
   */
  formatDuration(hours: number): string {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return minutes > 0 ? `${wholeHours}h ${minutes}m` : `${wholeHours}h`;
  }

  /**
   * Translation helper
   */
  t(key: string): string {
    return this.i18n.t(key);
  }
}