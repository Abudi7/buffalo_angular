/**
 * Analytics Dashboard Component - Data Visualization and Insights
 * 
 * This component provides comprehensive analytics and insights for time tracking data.
 * It includes various charts, metrics, and visualizations to help users understand
 * their productivity patterns and time usage.
 * 
 * Key Features:
 * - Time tracking trends and patterns
 * - Project distribution analysis
 * - Productivity insights and metrics
 * - Interactive charts and visualizations
 * - Date range filtering
 * - Export capabilities
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-01-15
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Ionic components
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon,
  IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonSegment,
  IonSegmentButton, IonRefresher, IonRefresherContent, IonDatetime,
  IonDatetimeButton, IonModal, IonHeader, IonToolbar, IonTitle,
  IonButtons, IonBackButton
} from '@ionic/angular/standalone';

// Chart.js components
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import { TimeService, TimeEntry } from '../../core/time.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonSelect, IonSelectOption, IonButton, IonIcon,
    IonGrid, IonRow, IonCol, IonChip, IonSkeletonText, IonSegment,
    IonSegmentButton, IonRefresher, IonRefresherContent, IonDatetime,
    IonDatetimeButton, IonModal, IonHeader, IonToolbar, IonTitle,
    IonButtons, IonBackButton,
    BaseChartDirective
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
   * Selected date range for analytics
   */
  selectedRange: 'week' | 'month' | 'quarter' | 'year' = 'month';
  
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

  // ===== ANALYTICS DATA =====
  
  /**
   * Total time tracked in hours
   */
  totalHours = 0;
  
  /**
   * Average daily hours
   */
  averageDailyHours = 0;
  
  /**
   * Most productive day of week
   */
  mostProductiveDay = '';
  
  /**
   * Most productive hour
   */
  mostProductiveHour = 0;
  
  /**
   * Total projects tracked
   */
  totalProjects = 0;
  
  /**
   * Most tracked project
   */
  topProject = '';

  // ===== CHART CONFIGURATIONS =====
  
  /**
   * Daily time tracking chart data
   */
  dailyChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      label: 'Hours Tracked',
      data: [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  
  /**
   * Project distribution pie chart data
   */
  projectChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
      ]
    }]
  };
  
  /**
   * Hourly productivity chart data
   */
  hourlyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'Productivity (Hours)',
      data: [],
      backgroundColor: '#3b82f6'
    }]
  };
  
  /**
   * Weekly comparison chart data
   */
  weeklyChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      label: 'This Week',
      data: [],
      backgroundColor: '#3b82f6'
    }, {
      label: 'Last Week',
      data: [],
      backgroundColor: '#6b7280'
    }]
  };

  // ===== CHART OPTIONS =====
  
  /**
   * Line chart options for daily tracking
   */
  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          }
        }
      }
    }
  };
  
  /**
   * Doughnut chart options for project distribution
   */
  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };
  
  /**
   * Bar chart options for hourly productivity
   */
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h';
          }
        }
      }
    }
  };

  // ===== DEPENDENCY INJECTION =====
  
  /**
   * TimeService for data operations
   */
  private timeService = inject(TimeService);
  
  /**
   * I18nService for translations
   */
  private i18n = inject(I18nService);

  // ===== LIFECYCLE HOOKS =====
  
  ngOnInit(): void {
    this.loadAnalytics();
  }

  // ===== DATA LOADING =====
  
  /**
   * Load analytics data and refresh charts
   */
  loadAnalytics(event?: CustomEvent): void {
    if (!event) this.loading = true;
    
    this.timeService.list().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.filterEntries();
        this.calculateMetrics();
        this.updateCharts();
        if (!event) this.loading = false;
        event?.detail.complete();
      },
      error: () => {
        if (!event) this.loading = false;
        event?.detail.complete();
      }
    });
  }

  // ===== DATA FILTERING =====
  
  /**
   * Filter entries based on selected date range
   */
  filterEntries(): void {
    const now = new Date();
    let startDate: Date;
    
    switch (this.selectedRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(this.startDate);
    }
    
    const endDate = this.selectedRange === 'custom' ? new Date(this.endDate) : now;
    
    this.filteredEntries = this.entries.filter(entry => {
      const entryDate = new Date(entry.start_at);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  // ===== METRICS CALCULATION =====
  
  /**
   * Calculate analytics metrics from filtered data
   */
  calculateMetrics(): void {
    if (this.filteredEntries.length === 0) {
      this.resetMetrics();
      return;
    }
    
    // Calculate total hours
    this.totalHours = this.filteredEntries.reduce((total, entry) => {
      if (entry.end_at) {
        const start = new Date(entry.start_at).getTime();
        const end = new Date(entry.end_at).getTime();
        return total + (end - start) / (1000 * 60 * 60);
      }
      return total;
    }, 0);
    
    // Calculate average daily hours
    const days = this.getDaysInRange();
    this.averageDailyHours = days > 0 ? this.totalHours / days : 0;
    
    // Find most productive day
    this.mostProductiveDay = this.getMostProductiveDay();
    
    // Find most productive hour
    this.mostProductiveHour = this.getMostProductiveHour();
    
    // Calculate project metrics
    const projectStats = this.getProjectStats();
    this.totalProjects = projectStats.size;
    this.topProject = this.getTopProject(projectStats);
  }
  
  /**
   * Reset metrics to default values
   */
  resetMetrics(): void {
    this.totalHours = 0;
    this.averageDailyHours = 0;
    this.mostProductiveDay = '';
    this.mostProductiveHour = 0;
    this.totalProjects = 0;
    this.topProject = '';
  }
  
  /**
   * Get number of days in selected range
   */
  getDaysInRange(): number {
    const now = new Date();
    let startDate: Date;
    
    switch (this.selectedRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(this.startDate);
    }
    
    return Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  /**
   * Get most productive day of the week
   */
  getMostProductiveDay(): string {
    const dayStats = new Map<string, number>();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    this.filteredEntries.forEach(entry => {
      if (entry.end_at) {
        const day = new Date(entry.start_at).getDay();
        const dayName = dayNames[day];
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        dayStats.set(dayName, (dayStats.get(dayName) || 0) + duration);
      }
    });
    
    let maxDay = '';
    let maxHours = 0;
    dayStats.forEach((hours, day) => {
      if (hours > maxHours) {
        maxHours = hours;
        maxDay = day;
      }
    });
    
    return maxDay;
  }
  
  /**
   * Get most productive hour of the day
   */
  getMostProductiveHour(): number {
    const hourStats = new Map<number, number>();
    
    this.filteredEntries.forEach(entry => {
      if (entry.end_at) {
        const hour = new Date(entry.start_at).getHours();
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        hourStats.set(hour, (hourStats.get(hour) || 0) + duration);
      }
    });
    
    let maxHour = 0;
    let maxHours = 0;
    hourStats.forEach((hours, hour) => {
      if (hours > maxHours) {
        maxHours = hours;
        maxHour = hour;
      }
    });
    
    return maxHour;
  }
  
  /**
   * Get project statistics
   */
  getProjectStats(): Map<string, number> {
    const projectStats = new Map<string, number>();
    
    this.filteredEntries.forEach(entry => {
      if (entry.end_at && entry.project) {
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        projectStats.set(entry.project, (projectStats.get(entry.project) || 0) + duration);
      }
    });
    
    return projectStats;
  }
  
  /**
   * Get top project by hours
   */
  getTopProject(projectStats: Map<string, number>): string {
    let topProject = '';
    let maxHours = 0;
    
    projectStats.forEach((hours, project) => {
      if (hours > maxHours) {
        maxHours = hours;
        topProject = project;
      }
    });
    
    return topProject;
  }

  // ===== CHART UPDATES =====
  
  /**
   * Update all charts with current data
   */
  updateCharts(): void {
    this.updateDailyChart();
    this.updateProjectChart();
    this.updateHourlyChart();
    this.updateWeeklyChart();
  }
  
  /**
   * Update daily time tracking chart
   */
  updateDailyChart(): void {
    const dailyData = this.getDailyData();
    this.dailyChartData = {
      labels: dailyData.labels,
      datasets: [{
        label: 'Hours Tracked',
        data: dailyData.data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
  }
  
  /**
   * Update project distribution chart
   */
  updateProjectChart(): void {
    const projectData = this.getProjectData();
    this.projectChartData = {
      labels: projectData.labels,
      datasets: [{
        data: projectData.data,
        backgroundColor: [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
          '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
        ]
      }]
    };
  }
  
  /**
   * Update hourly productivity chart
   */
  updateHourlyChart(): void {
    const hourlyData = this.getHourlyData();
    this.hourlyChartData = {
      labels: hourlyData.labels,
      datasets: [{
        label: 'Productivity (Hours)',
        data: hourlyData.data,
        backgroundColor: '#3b82f6'
      }]
    };
  }
  
  /**
   * Update weekly comparison chart
   */
  updateWeeklyChart(): void {
    const weeklyData = this.getWeeklyData();
    this.weeklyChartData = {
      labels: weeklyData.labels,
      datasets: [{
        label: 'This Week',
        data: weeklyData.thisWeek,
        backgroundColor: '#3b82f6'
      }, {
        label: 'Last Week',
        data: weeklyData.lastWeek,
        backgroundColor: '#6b7280'
      }]
    };
  }

  // ===== DATA PROCESSING =====
  
  /**
   * Get daily time tracking data
   */
  getDailyData(): { labels: string[], data: number[] } {
    const dailyStats = new Map<string, number>();
    const labels: string[] = [];
    const data: number[] = [];
    
    // Generate date range
    const days = this.getDaysInRange();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats.set(dateStr, 0);
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Aggregate data
    this.filteredEntries.forEach(entry => {
      if (entry.end_at) {
        const dateStr = new Date(entry.start_at).toISOString().split('T')[0];
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        dailyStats.set(dateStr, (dailyStats.get(dateStr) || 0) + duration);
      }
    });
    
    // Convert to arrays
    dailyStats.forEach(hours => data.push(Math.round(hours * 10) / 10));
    
    return { labels, data };
  }
  
  /**
   * Get project distribution data
   */
  getProjectData(): { labels: string[], data: number[] } {
    const projectStats = this.getProjectStats();
    const labels: string[] = [];
    const data: number[] = [];
    
    // Sort by hours (descending) and take top 8
    const sortedProjects = Array.from(projectStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    
    sortedProjects.forEach(([project, hours]) => {
      labels.push(project || 'No Project');
      data.push(Math.round(hours * 10) / 10);
    });
    
    return { labels, data };
  }
  
  /**
   * Get hourly productivity data
   */
  getHourlyData(): { labels: string[], data: number[] } {
    const hourlyStats = new Map<number, number>();
    const labels: string[] = [];
    const data: number[] = [];
    
    // Initialize all hours
    for (let hour = 0; hour < 24; hour++) {
      hourlyStats.set(hour, 0);
      labels.push(hour.toString().padStart(2, '0') + ':00');
    }
    
    // Aggregate data
    this.filteredEntries.forEach(entry => {
      if (entry.end_at) {
        const hour = new Date(entry.start_at).getHours();
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        hourlyStats.set(hour, (hourStats.get(hour) || 0) + duration);
      }
    });
    
    // Convert to arrays
    hourlyStats.forEach(hours => data.push(Math.round(hours * 10) / 10));
    
    return { labels, data };
  }
  
  /**
   * Get weekly comparison data
   */
  getWeeklyData(): { labels: string[], thisWeek: number[], lastWeek: number[] } {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const thisWeek: number[] = [];
    const lastWeek: number[] = [];
    
    // Initialize arrays
    for (let i = 0; i < 7; i++) {
      thisWeek.push(0);
      lastWeek.push(0);
    }
    
    // Calculate week boundaries
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay() + 1); // Monday
    thisWeekStart.setHours(0, 0, 0, 0);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    // Aggregate data
    this.filteredEntries.forEach(entry => {
      if (entry.end_at) {
        const entryDate = new Date(entry.start_at);
        const duration = (new Date(entry.end_at).getTime() - new Date(entry.start_at).getTime()) / (1000 * 60 * 60);
        
        if (entryDate >= thisWeekStart && entryDate < new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)) {
          const dayIndex = (entryDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
          thisWeek[dayIndex] += duration;
        } else if (entryDate >= lastWeekStart && entryDate < thisWeekStart) {
          const dayIndex = (entryDate.getDay() + 6) % 7;
          lastWeek[dayIndex] += duration;
        }
      }
    });
    
    // Round values
    for (let i = 0; i < 7; i++) {
      thisWeek[i] = Math.round(thisWeek[i] * 10) / 10;
      lastWeek[i] = Math.round(lastWeek[i] * 10) / 10;
    }
    
    return { labels, thisWeek, lastWeek };
  }

  // ===== EVENT HANDLERS =====
  
  /**
   * Handle date range selection change
   */
  onRangeChange(): void {
    this.filterEntries();
    this.calculateMetrics();
    this.updateCharts();
  }
  
  /**
   * Handle custom date selection
   */
  onDateChange(): void {
    this.selectedRange = 'custom';
    this.onRangeChange();
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Get translation for key
   */
  t(key: string): string {
    return this.i18n.t(key);
  }
  
  /**
   * Format hours for display
   */
  formatHours(hours: number): string {
    if (hours < 1) {
      return Math.round(hours * 60) + 'm';
    }
    return Math.round(hours * 10) / 10 + 'h';
  }
  
  /**
   * Format percentage for display
   */
  formatPercentage(value: number, total: number): string {
    if (total === 0) return '0%';
    return Math.round((value / total) * 100) + '%';
  }
}
