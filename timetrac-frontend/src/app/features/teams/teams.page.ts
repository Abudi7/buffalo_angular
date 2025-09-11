/**
 * Teams Page Component - Team Management Interface
 * 
 * This component provides a comprehensive interface for team management
 * including team creation, member management, and collaboration features.
 * 
 * Key Features:
 * - View all teams for the current user
 * - Create new teams
 * - Manage team members and roles
 * - Handle team invitations
 * - Team collaboration features
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
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton,
  IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonInput, IonTextarea, IonSelect, IonSelectOption, IonChip,
  IonList, IonAvatar, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonAlert, IonActionSheet, IonToast, IonBadge, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';

import { TeamService, Team, TeamMember, TeamMemberRole, CreateTeamRequest, InviteMemberRequest } from '../../core/team.service';
import { I18nService } from '../../core/i18n.service';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonItem, IonLabel, IonButton, IonIcon, IonFab, IonFabButton,
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonInput, IonTextarea, IonSelect, IonSelectOption, IonChip,
    IonList, IonAvatar, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonAlert, IonActionSheet, IonToast, IonBadge, IonGrid, IonRow, IonCol
  ],
  templateUrl: './teams.page.html',
  styleUrls: ['./teams.page.scss'],
})
export class TeamsPage implements OnInit {
  // ===== COMPONENT STATE =====
  
  /**
   * Loading state for data fetching
   */
  loading = false;
  
  /**
   * Teams data
   */
  teams: Team[] = [];
  
  /**
   * Pending invitations
   */
  pendingInvitations: TeamMember[] = [];

  // ===== MODAL STATES =====
  
  /**
   * Create team modal state
   */
  showCreateModal = false;
  
  /**
   * Invite member modal state
   */
  showInviteModal = false;
  
  /**
   * Selected team for operations
   */
  selectedTeam: Team | null = null;

  // ===== FORM DATA =====
  
  /**
   * Create team form data
   */
  createTeamForm: CreateTeamRequest = {
    name: '',
    description: ''
  };
  
  /**
   * Invite member form data
   */
  inviteForm: InviteMemberRequest = {
    email: '',
    role: 'member'
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
   * TeamService for team operations
   */
  private teamService = inject(TeamService);
  
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
    this.loadTeams();
    this.loadPendingInvitations();
  }

  // ===== DATA LOADING =====
  
  /**
   * Load teams and refresh data
   */
  loadTeams(event?: CustomEvent): void {
    if (!event) this.loading = true;
    
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        if (!event) this.loading = false;
        event?.detail.complete();
      },
      error: (error) => {
        console.error('Error loading teams:', error);
        this.showError('Failed to load teams');
        if (!event) this.loading = false;
        event?.detail.complete();
      }
    });
  }
  
  /**
   * Load pending invitations
   */
  loadPendingInvitations(): void {
    this.teamService.getPendingInvitations().subscribe({
      next: (invitations) => {
        this.pendingInvitations = invitations;
      },
      error: (error) => {
        console.error('Error loading invitations:', error);
      }
    });
  }

  // ===== TEAM OPERATIONS =====
  
  /**
   * Create a new team
   */
  createTeam(): void {
    if (!this.createTeamForm.name.trim()) {
      this.showError('Team name is required');
      return;
    }
    
    this.teamService.createTeam(this.createTeamForm).subscribe({
      next: (team) => {
        this.teams.unshift(team);
        this.showCreateModal = false;
        this.resetCreateForm();
        this.showSuccess('Team created successfully');
      },
      error: (error) => {
        console.error('Error creating team:', error);
        this.showError('Failed to create team');
      }
    });
  }
  
  /**
   * Open team details
   */
  openTeam(team: Team): void {
    this.router.navigate(['/teams', team.id]);
  }
  
  /**
   * Delete team (placeholder)
   */
  deleteTeam(team: Team): void {
    // TODO: Implement team deletion
    this.showError('Team deletion not implemented yet');
  }

  // ===== MEMBER OPERATIONS =====
  
  /**
   * Invite member to team
   */
  inviteMember(): void {
    if (!this.inviteForm.email.trim()) {
      this.showError('Email is required');
      return;
    }
    
    if (!this.selectedTeam) {
      this.showError('No team selected');
      return;
    }
    
    this.teamService.inviteMember(this.selectedTeam.id, this.inviteForm).subscribe({
      next: () => {
        this.showInviteModal = false;
        this.resetInviteForm();
        this.showSuccess('Invitation sent successfully');
      },
      error: (error) => {
        console.error('Error inviting member:', error);
        this.showError('Failed to send invitation');
      }
    });
  }
  
  /**
   * Accept team invitation
   */
  acceptInvitation(invitation: TeamMember): void {
    this.teamService.acceptInvitation(invitation.id).subscribe({
      next: () => {
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.id !== invitation.id);
        this.loadTeams(); // Refresh teams list
        this.showSuccess('Invitation accepted');
      },
      error: (error) => {
        console.error('Error accepting invitation:', error);
        this.showError('Failed to accept invitation');
      }
    });
  }
  
  /**
   * Decline team invitation
   */
  declineInvitation(invitation: TeamMember): void {
    this.teamService.declineInvitation(invitation.id).subscribe({
      next: () => {
        this.pendingInvitations = this.pendingInvitations.filter(inv => inv.id !== invitation.id);
        this.showSuccess('Invitation declined');
      },
      error: (error) => {
        console.error('Error declining invitation:', error);
        this.showError('Failed to decline invitation');
      }
    });
  }

  // ===== MODAL OPERATIONS =====
  
  /**
   * Open create team modal
   */
  openCreateModal(): void {
    this.showCreateModal = true;
  }
  
  /**
   * Close create team modal
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetCreateForm();
  }
  
  /**
   * Open invite member modal
   */
  openInviteModal(team: Team): void {
    this.selectedTeam = team;
    this.showInviteModal = true;
  }
  
  /**
   * Close invite member modal
   */
  closeInviteModal(): void {
    this.showInviteModal = false;
    this.selectedTeam = null;
    this.resetInviteForm();
  }

  // ===== FORM HELPERS =====
  
  /**
   * Reset create team form
   */
  resetCreateForm(): void {
    this.createTeamForm = {
      name: '',
      description: ''
    };
  }
  
  /**
   * Reset invite form
   */
  resetInviteForm(): void {
    this.inviteForm = {
      email: '',
      role: 'member'
    };
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Get translation for key
   */
  t(key: string): string {
    return this.i18n.t(key);
  }
  
  /**
   * Get role display name
   */
  getRoleDisplayName(role: TeamMemberRole): string {
    return this.teamService.getRoleDisplayName(role);
  }
  
  /**
   * Get role color
   */
  getRoleColor(role: TeamMemberRole): string {
    return this.teamService.getRoleColor(role);
  }
  
  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    return this.teamService.getStatusDisplayName(status);
  }
  
  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    return this.teamService.getStatusColor(status);
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
   * Get user avatar URL
   */
  getAvatarUrl(email: string): string {
    // Generate avatar URL from email (using Gravatar or similar)
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=3b82f6&color=fff&size=40`;
  }
  
  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
  
  /**
   * Get available roles for invitation
   */
  getAvailableRoles(): TeamMemberRole[] {
    return ['admin', 'manager', 'member', 'viewer'];
  }
}
