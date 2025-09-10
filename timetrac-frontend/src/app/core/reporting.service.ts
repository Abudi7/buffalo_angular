/**
 * Reporting Service - Advanced Reporting and PDF Generation
 * 
 * This service handles advanced reporting features including PDF generation,
 * scheduled reports, and various export formats for time tracking data.
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TimeEntry } from './time.service';

/**
 * Report type enumeration
 */
export type ReportType = 'summary' | 'detailed' | 'project' | 'team' | 'client';

/**
 * Report format enumeration
 */
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';

/**
 * Report schedule enumeration
 */
export type ReportSchedule = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

/**
 * Report filter interface
 */
export interface ReportFilter {
  startDate: string;
  endDate: string;
  projects?: string[];
  users?: string[];
  teams?: string[];
  tags?: string[];
}

/**
 * Report configuration interface
 */
export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  title: string;
  description?: string;
  filters: ReportFilter;
  includeCharts: boolean;
  includeDetails: boolean;
  groupBy?: 'day' | 'week' | 'month' | 'project' | 'user';
  sortBy?: 'date' | 'project' | 'duration' | 'user';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Scheduled report interface
 */
export interface ScheduledReport {
  id: string;
  name: string;
  config: ReportConfig;
  schedule: ReportSchedule;
  recipients: string[];
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Report generation request interface
 */
export interface GenerateReportRequest {
  config: ReportConfig;
  emailTo?: string;
}

/**
 * Report data interface
 */
export interface ReportData {
  summary: {
    totalHours: number;
    totalEntries: number;
    averageDailyHours: number;
    mostProductiveDay: string;
    topProject: string;
  };
  entries: TimeEntry[];
  charts: {
    dailyHours: { date: string; hours: number }[];
    projectDistribution: { project: string; hours: number; percentage: number }[];
    hourlyProductivity: { hour: number; hours: number }[];
  };
  metadata: {
    generatedAt: string;
    period: string;
    filters: ReportFilter;
  };
}

/**
 * API response interface
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_BASE}/api/reports`;

  /**
   * Generate a report
   */
  generateReport(request: GenerateReportRequest): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/generate`, request, {
      responseType: 'blob'
    });
  }

  /**
   * Get report data for preview
   */
  getReportData(config: ReportConfig): Observable<ReportData> {
    return this.http.post<ApiResponse<ReportData>>(`${this.baseUrl}/preview`, { config })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Create a scheduled report
   */
  createScheduledReport(report: Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at'>): Observable<ScheduledReport> {
    return this.http.post<ApiResponse<ScheduledReport>>(`${this.baseUrl}/scheduled`, report)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get all scheduled reports
   */
  getScheduledReports(): Observable<ScheduledReport[]> {
    return this.http.get<ApiResponse<ScheduledReport[]>>(`${this.baseUrl}/scheduled`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Update a scheduled report
   */
  updateScheduledReport(id: string, report: Partial<ScheduledReport>): Observable<ScheduledReport> {
    return this.http.put<ApiResponse<ScheduledReport>>(`${this.baseUrl}/scheduled/${id}`, report)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Delete a scheduled report
   */
  deleteScheduledReport(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/scheduled/${id}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get report templates
   */
  getReportTemplates(): Observable<ReportConfig[]> {
    return this.http.get<ApiResponse<ReportConfig[]>>(`${this.baseUrl}/templates`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Save report template
   */
  saveReportTemplate(template: ReportConfig): Observable<ReportConfig> {
    return this.http.post<ApiResponse<ReportConfig>>(`${this.baseUrl}/templates`, template)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Download report as file
   */
  downloadReport(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate filename for report
   */
  generateFilename(config: ReportConfig): string {
    const date = new Date().toISOString().split('T')[0];
    const startDate = config.filters.startDate.split('T')[0];
    const endDate = config.filters.endDate.split('T')[0];
    
    let filename = `timetrac-${config.type}-${startDate}-to-${endDate}`;
    
    if (config.filters.projects && config.filters.projects.length > 0) {
      filename += `-${config.filters.projects[0]}`;
    }
    
    filename += `.${config.format}`;
    
    return filename;
  }

  /**
   * Get report type display name
   */
  getReportTypeDisplayName(type: ReportType): string {
    const typeNames: Record<ReportType, string> = {
      summary: 'Summary Report',
      detailed: 'Detailed Report',
      project: 'Project Report',
      team: 'Team Report',
      client: 'Client Report'
    };
    return typeNames[type] || type;
  }

  /**
   * Get report format display name
   */
  getReportFormatDisplayName(format: ReportFormat): string {
    const formatNames: Record<ReportFormat, string> = {
      pdf: 'PDF Document',
      csv: 'CSV Spreadsheet',
      excel: 'Excel Workbook',
      json: 'JSON Data'
    };
    return formatNames[format] || format;
  }

  /**
   * Get schedule display name
   */
  getScheduleDisplayName(schedule: ReportSchedule): string {
    const scheduleNames: Record<ReportSchedule, string> = {
      none: 'Manual Only',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly'
    };
    return scheduleNames[schedule] || schedule;
  }

  /**
   * Get group by display name
   */
  getGroupByDisplayName(groupBy: string): string {
    const groupNames: Record<string, string> = {
      day: 'Day',
      week: 'Week',
      month: 'Month',
      project: 'Project',
      user: 'User'
    };
    return groupNames[groupBy] || groupBy;
  }

  /**
   * Get sort by display name
   */
  getSortByDisplayName(sortBy: string): string {
    const sortNames: Record<string, string> = {
      date: 'Date',
      project: 'Project',
      duration: 'Duration',
      user: 'User'
    };
    return sortNames[sortBy] || sortBy;
  }

  /**
   * Format duration for display
   */
  formatDuration(hours: number): string {
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

  /**
   * Get default report configuration
   */
  getDefaultReportConfig(): ReportConfig {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    return {
      type: 'summary',
      format: 'pdf',
      title: 'Time Tracking Report',
      filters: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString()
      },
      includeCharts: true,
      includeDetails: true,
      groupBy: 'day',
      sortBy: 'date',
      sortOrder: 'desc'
    };
  }

  /**
   * Validate report configuration
   */
  validateReportConfig(config: ReportConfig): string[] {
    const errors: string[] = [];
    
    if (!config.title.trim()) {
      errors.push('Report title is required');
    }
    
    if (!config.filters.startDate || !config.filters.endDate) {
      errors.push('Date range is required');
    }
    
    if (config.filters.startDate && config.filters.endDate) {
      const start = new Date(config.filters.startDate);
      const end = new Date(config.filters.endDate);
      
      if (start >= end) {
        errors.push('End date must be after start date');
      }
      
      const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        errors.push('Date range cannot exceed 365 days');
      }
    }
    
    return errors;
  }
}

// Import map operator
import { map } from 'rxjs/operators';
