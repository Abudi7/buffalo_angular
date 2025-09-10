/**
 * Reports Page Component - Advanced Reporting Interface
 * 
 * This component provides a comprehensive interface for generating reports,
 * managing scheduled reports, and exporting time tracking data in various formats.
 * 
 * Key Features:
 * - Generate custom reports with filters
 * - PDF, CSV, Excel, and JSON export formats
 * - Scheduled report management
 * - Report templates and presets
 * - Advanced filtering and grouping options
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-01-15
 */
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Ionic components
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonChip,
  IonList, IonAvatar, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonAlert, IonActionSheet, IonToast, IonBadge, IonGrid, IonRow, IonCol,
  IonDatetime, IonDatetimeButton, IonCheckbox, IonSegment, IonSegmentButton,
  IonAccordion, IonAccordionGroup, IonToggle
} from '@ionic/angular/standalone';

import { 
  ReportingService, 
  ReportConfig, 
  ReportType, 
  ReportFormat, 
  ReportSchedule,
  ScheduledReport,
  ReportData,
  GenerateReportRequest
} from '../../core/reporting.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonChip,
    IonList, IonAvatar, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonAlert, IonActionSheet, IonToast, IonBadge, IonGrid, IonRow, IonCol,
    IonDatetime, IonDatetimeButton, IonCheckbox, IonSegment, IonSegmentButton,
    IonAccordion, IonAccordionGroup, IonToggle
  ],
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
  // ===== COMPONENT STATE =====
  
  /**
   * Loading state for data fetching
   */
  loading = false;
  
  /**
   * Generating report state
   */
  generating = false;
  
  /**
   * Scheduled reports data
   */
  scheduledReports: ScheduledReport[] = [];
  
  /**
   * Report templates
   */
  reportTemplates: ReportConfig[] = [];

  // ===== MODAL STATES =====
  
  /**
   * Generate report modal state
   */
  showGenerateModal = false;
  
  /**
   * Schedule report modal state
   */
  showScheduleModal = false;
  
  /**
   * Preview report modal state
   */
  showPreviewModal = false;
  
  /**
   * Preview data
   */
  previewData: ReportData | null = null;

  // ===== FORM DATA =====
  
  /**
   * Current report configuration
   */
  reportConfig: ReportConfig = this.reportingService.getDefaultReportConfig();
  
  /**
   * Scheduled report form data
   */
  scheduledReport: Partial<ScheduledReport> = {
    name: '',
    config: this.reportConfig,
    schedule: 'none',
    recipients: [],
    isActive: true
  };

  // ===== ALERT STATES =====
  
  /**
   * Alert configuration
   */
  alertButtons = ['OK'];
  alertMessage = '';
  showAlert = false;
  
  /**
   * Toast configuration
   */
  toastMessage = '';
  showToast = false;
  toastColor = 'success';

  // ===== DEPENDENCY INJECTION =====
  
  /**
   * ReportingService for report operations
   */
  private reportingService = inject(ReportingService);
  
  /**
   * I18nService for translations
   */
  private i18n = inject(I18nService);
  
  /**
   * Router for navigation
   */
  private router = inject(Router);

  // ===== LIFECYCLE HOOKS =====
  
  ngOnInit(): void {
    this.loadScheduledReports();
    this.loadReportTemplates();
  }

  // ===== DATA LOADING =====
  
  /**
   * Load scheduled reports
   */
  loadScheduledReports(event?: CustomEvent): void {
    if (!event) this.loading = true;
    
    this.reportingService.getScheduledReports().subscribe({
      next: (reports) => {
        this.scheduledReports = reports;
        if (!event) this.loading = false;
        event?.detail.complete();
      },
      error: (error) => {
        console.error('Error loading scheduled reports:', error);
        this.showError('Failed to load scheduled reports');
        if (!event) this.loading = false;
        event?.detail.complete();
      }
    });
  }
  
  /**
   * Load report templates
   */
  loadReportTemplates(): void {
    this.reportingService.getReportTemplates().subscribe({
      next: (templates) => {
        this.reportTemplates = templates;
      },
      error: (error) => {
        console.error('Error loading templates:', error);
      }
    });
  }

  // ===== REPORT OPERATIONS =====
  
  /**
   * Generate a report
   */
  generateReport(): void {
    const errors = this.reportingService.validateReportConfig(this.reportConfig);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      return;
    }
    
    this.generating = true;
    
    const request: GenerateReportRequest = {
      config: this.reportConfig
    };
    
    this.reportingService.generateReport(request).subscribe({
      next: (blob) => {
        const filename = this.reportingService.generateFilename(this.reportConfig);
        this.reportingService.downloadReport(blob, filename);
        this.showGenerateModal = false;
        this.generating = false;
        this.showSuccess('Report generated successfully');
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.generating = false;
        this.showError('Failed to generate report');
      }
    });
  }
  
  /**
   * Preview report data
   */
  previewReport(): void {
    const errors = this.reportingService.validateReportConfig(this.reportConfig);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      return;
    }
    
    this.reportingService.getReportData(this.reportConfig).subscribe({
      next: (data) => {
        this.previewData = data;
        this.showPreviewModal = true;
      },
      error: (error) => {
        console.error('Error previewing report:', error);
        this.showError('Failed to preview report');
      }
    });
  }
  
  /**
   * Create scheduled report
   */
  createScheduledReport(): void {
    if (!this.scheduledReport.name?.trim()) {
      this.showError('Report name is required');
      return;
    }
    
    const errors = this.reportingService.validateReportConfig(this.scheduledReport.config!);
    if (errors.length > 0) {
      this.showError(errors.join(', '));
      return;
    }
    
    this.reportingService.createScheduledReport(this.scheduledReport as Omit<ScheduledReport, 'id' | 'created_at' | 'updated_at'>).subscribe({
      next: (report) => {
        this.scheduledReports.unshift(report);
        this.showScheduleModal = false;
        this.resetScheduledForm();
        this.showSuccess('Scheduled report created successfully');
      },
      error: (error) => {
        console.error('Error creating scheduled report:', error);
        this.showError('Failed to create scheduled report');
      }
    });
  }
  
  /**
   * Delete scheduled report
   */
  deleteScheduledReport(report: ScheduledReport): void {
    this.reportingService.deleteScheduledReport(report.id).subscribe({
      next: () => {
        this.scheduledReports = this.scheduledReports.filter(r => r.id !== report.id);
        this.showSuccess('Scheduled report deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting scheduled report:', error);
        this.showError('Failed to delete scheduled report');
      }
    });
  }
  
  /**
   * Toggle scheduled report active state
   */
  toggleScheduledReport(report: ScheduledReport): void {
    const updatedReport = { ...report, isActive: !report.isActive };
    
    this.reportingService.updateScheduledReport(report.id, updatedReport).subscribe({
      next: (updated) => {
        const index = this.scheduledReports.findIndex(r => r.id === report.id);
        if (index !== -1) {
          this.scheduledReports[index] = updated;
        }
        this.showSuccess(`Report ${updated.isActive ? 'activated' : 'deactivated'} successfully`);
      },
      error: (error) => {
        console.error('Error updating scheduled report:', error);
        this.showError('Failed to update scheduled report');
      }
    });
  }

  // ===== MODAL OPERATIONS =====
  
  /**
   * Open generate report modal
   */
  openGenerateModal(): void {
    this.reportConfig = this.reportingService.getDefaultReportConfig();
    this.showGenerateModal = true;
  }
  
  /**
   * Close generate report modal
   */
  closeGenerateModal(): void {
    this.showGenerateModal = false;
  }
  
  /**
   * Open schedule report modal
   */
  openScheduleModal(): void {
    this.scheduledReport = {
      name: '',
      config: this.reportingService.getDefaultReportConfig(),
      schedule: 'none',
      recipients: [],
      isActive: true
    };
    this.showScheduleModal = true;
  }
  
  /**
   * Close schedule report modal
   */
  closeScheduleModal(): void {
    this.showScheduleModal = false;
    this.resetScheduledForm();
  }
  
  /**
   * Close preview modal
   */
  closePreviewModal(): void {
    this.showPreviewModal = false;
    this.previewData = null;
  }

  // ===== FORM HELPERS =====
  
  /**
   * Reset scheduled report form
   */
  resetScheduledForm(): void {
    this.scheduledReport = {
      name: '',
      config: this.reportingService.getDefaultReportConfig(),
      schedule: 'none',
      recipients: [],
      isActive: true
    };
  }
  
  /**
   * Load template into current config
   */
  loadTemplate(template: ReportConfig): void {
    this.reportConfig = { ...template };
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Get translation for key
   */
  t(key: string): string {
    return this.i18n.t(key);
  }
  
  /**
   * Get report type display name
   */
  getReportTypeDisplayName(type: ReportType): string {
    return this.reportingService.getReportTypeDisplayName(type);
  }
  
  /**
   * Get report format display name
   */
  getReportFormatDisplayName(format: ReportFormat): string {
    return this.reportingService.getReportFormatDisplayName(format);
  }
  
  /**
   * Get schedule display name
   */
  getScheduleDisplayName(schedule: ReportSchedule): string {
    return this.reportingService.getScheduleDisplayName(schedule);
  }
  
  /**
   * Get group by display name
   */
  getGroupByDisplayName(groupBy: string): string {
    return this.reportingService.getGroupByDisplayName(groupBy);
  }
  
  /**
   * Get sort by display name
   */
  getSortByDisplayName(sortBy: string): string {
    return this.reportingService.getSortByDisplayName(sortBy);
  }
  
  /**
   * Format duration for display
   */
  formatDuration(hours: number): string {
    return this.reportingService.formatDuration(hours);
  }
  
  /**
   * Format percentage for display
   */
  formatPercentage(value: number, total: number): string {
    return this.reportingService.formatPercentage(value, total);
  }
  
  /**
   * Show success message
   */
  showSuccess(message: string): void {
    this.toastMessage = message;
    this.toastColor = 'success';
    this.showToast = true;
  }
  
  /**
   * Show error message
   */
  showError(message: string): void {
    this.toastMessage = message;
    this.toastColor = 'danger';
    this.showToast = true;
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  /**
   * Get available report types
   */
  getAvailableReportTypes(): ReportType[] {
    return ['summary', 'detailed', 'project', 'team', 'client'];
  }
  
  /**
   * Get available report formats
   */
  getAvailableReportFormats(): ReportFormat[] {
    return ['pdf', 'csv', 'excel', 'json'];
  }
  
  /**
   * Get available schedules
   */
  getAvailableSchedules(): ReportSchedule[] {
    return ['none', 'daily', 'weekly', 'monthly', 'quarterly'];
  }
  
  /**
   * Get available group by options
   */
  getAvailableGroupByOptions(): string[] {
    return ['day', 'week', 'month', 'project', 'user'];
  }
  
  /**
   * Get available sort by options
   */
  getAvailableSortByOptions(): string[] {
    return ['date', 'project', 'duration', 'user'];
  }
}
