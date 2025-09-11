/**
 * Team Service - Team Management and Collaboration
 * 
 * This service handles all team-related operations including team creation,
 * member management, invitations, and collaboration features.
 * 
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Team interface representing a team entity
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  settings: string;
  created_at: string;
  updated_at: string;
}

/**
 * Team member role enumeration
 */
export type TeamMemberRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

/**
 * Team member interface representing a team membership
 */
export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  status: 'active' | 'pending' | 'suspended';
  invited_by: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    created_at: string;
  };
}

/**
 * Team with members interface
 */
export interface TeamWithMembers extends Team {
  members: TeamMember[];
  user_role: TeamMemberRole;
}

/**
 * Create team request interface
 */
export interface CreateTeamRequest {
  name: string;
  description?: string;
}

/**
 * Invite member request interface
 */
export interface InviteMemberRequest {
  email: string;
  role: TeamMemberRole;
}

/**
 * Update member role request interface
 */
export interface UpdateMemberRoleRequest {
  role: TeamMemberRole;
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
export class TeamService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.API_BASE}/api/teams`;

  /**
   * Create a new team
   */
  createTeam(request: CreateTeamRequest): Observable<Team> {
    return this.http.post<ApiResponse<Team>>(`${this.baseUrl}`, request)
      .pipe(
        // Extract data from API response
        map(response => response.data)
      );
  }

  /**
   * Get all teams for the current user
   */
  getTeams(): Observable<Team[]> {
    return this.http.get<ApiResponse<Team[]>>(`${this.baseUrl}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get a specific team with members
   */
  getTeam(teamId: string): Observable<TeamWithMembers> {
    return this.http.get<ApiResponse<TeamWithMembers>>(`${this.baseUrl}/${teamId}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Invite a user to join the team
   */
  inviteMember(teamId: string, request: InviteMemberRequest): Observable<TeamMember> {
    return this.http.post<ApiResponse<TeamMember>>(`${this.baseUrl}/${teamId}/invite`, request)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Update a team member's role
   */
  updateMemberRole(teamId: string, memberId: string, request: UpdateMemberRoleRequest): Observable<TeamMember> {
    return this.http.put<ApiResponse<TeamMember>>(`${this.baseUrl}/${teamId}/members/${memberId}`, request)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Remove a member from the team
   */
  removeMember(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${teamId}/members/${memberId}`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Accept a team invitation
   */
  acceptInvitation(invitationId: string): Observable<TeamMember> {
    return this.http.post<ApiResponse<TeamMember>>(`${this.baseUrl}/invitations/${invitationId}/accept`, {})
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Decline a team invitation
   */
  declineInvitation(invitationId: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/invitations/${invitationId}/decline`, {})
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Get pending invitations for the current user
   */
  getPendingInvitations(): Observable<TeamMember[]> {
    return this.http.get<ApiResponse<TeamMember[]>>(`${this.baseUrl.replace('/teams', '')}/pending`)
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * Check if user has permission in team
   */
  hasPermission(role: TeamMemberRole, permission: string): boolean {
    switch (role) {
      case 'owner':
        return true; // Owner has all permissions
      case 'admin':
        return permission !== 'delete_team' && permission !== 'transfer_ownership';
      case 'manager':
        return ['view_team', 'manage_projects', 'view_analytics', 'invite_members'].includes(permission);
      case 'member':
        return ['view_team', 'view_analytics'].includes(permission);
      case 'viewer':
        return permission === 'view_team';
      default:
        return false;
    }
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role: TeamMemberRole): string {
    const roleNames: Record<TeamMemberRole, string> = {
      owner: 'Owner',
      admin: 'Admin',
      manager: 'Manager',
      member: 'Member',
      viewer: 'Viewer'
    };
    return roleNames[role] || role;
  }

  /**
   * Get role color for UI
   */
  getRoleColor(role: TeamMemberRole): string {
    const roleColors: Record<TeamMemberRole, string> = {
      owner: '#f59e0b',    // amber
      admin: '#ef4444',    // red
      manager: '#3b82f6',  // blue
      member: '#10b981',   // emerald
      viewer: '#6b7280'    // gray
    };
    return roleColors[role] || '#6b7280';
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: string): string {
    const statusNames: Record<string, string> = {
      active: 'Active',
      pending: 'Pending',
      suspended: 'Suspended'
    };
    return statusNames[status] || status;
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const statusColors: Record<string, string> = {
      active: '#10b981',    // emerald
      pending: '#f59e0b',   // amber
      suspended: '#ef4444'  // red
    };
    return statusColors[status] || '#6b7280';
  }
}

// Import map operator
import { map } from 'rxjs/operators';
