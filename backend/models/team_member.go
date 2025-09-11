/**
 * TeamMember Model - Team Membership Data Structure
 *
 * This package defines the TeamMember model which represents team memberships
 * in the TimeTrac application. It includes user roles, permissions, and
 * membership status.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
package models

import (
	"time"

	"github.com/gofrs/uuid"
)

/**
 * TeamMemberRole represents the role of a team member
 */
type TeamMemberRole string

const (
	RoleOwner   TeamMemberRole = "owner"   // Team owner with full permissions
	RoleAdmin   TeamMemberRole = "admin"   // Team admin with management permissions
	RoleManager TeamMemberRole = "manager" // Project manager with limited admin permissions
	RoleMember  TeamMemberRole = "member"  // Regular team member
	RoleViewer  TeamMemberRole = "viewer"  // Read-only access
)

/**
 * TeamMember represents a team membership in the TimeTrac system
 *
 * This struct defines the complete team membership data model including:
 * - Team and user references
 * - Role and permissions
 * - Membership status and metadata
 *
 * Database Fields:
 * - id: Primary key (UUID)
 * - team_id: Foreign key to teams table
 * - user_id: Foreign key to users table
 * - role: Member role (owner, admin, manager, member, viewer)
 * - status: Membership status (active, pending, suspended)
 * - invited_by: User ID who invited this member
 * - joined_at: When the member joined the team
 * - created_at: Membership creation timestamp
 * - updated_at: Last modification timestamp
 *
 * JSON Serialization:
 * - All fields are included in API responses
 * - Role field uses string values for easy frontend handling
 */
type TeamMember struct {
	ID        uuid.UUID      `db:"id" json:"id"`                 // Unique membership identifier
	TeamID    uuid.UUID      `db:"team_id" json:"team_id"`       // Team reference
	UserID    uuid.UUID      `db:"user_id" json:"user_id"`       // User reference
	Role      TeamMemberRole `db:"role" json:"role"`             // Member role
	Status    string         `db:"status" json:"status"`         // Membership status
	InvitedBy uuid.UUID      `db:"invited_by" json:"invited_by"` // Who invited this member
	JoinedAt  *time.Time     `db:"joined_at" json:"joined_at"`   // When member joined
	CreatedAt time.Time      `db:"created_at" json:"created_at"` // Membership creation timestamp
	UpdatedAt time.Time      `db:"updated_at" json:"updated_at"` // Last modification timestamp
}

/**
 * TableName returns the database table name for the TeamMember model
 */
func (tm TeamMember) TableName() string { return "team_members" }

/**
 * HasPermission checks if the team member has a specific permission
 */
func (tm TeamMember) HasPermission(permission string) bool {
	switch tm.Role {
	case RoleOwner:
		return true // Owner has all permissions
	case RoleAdmin:
		return permission != "delete_team" && permission != "transfer_ownership"
	case RoleManager:
		return permission == "view_team" || permission == "manage_projects" ||
			permission == "view_analytics" || permission == "invite_members"
	case RoleMember:
		return permission == "view_team" || permission == "view_analytics"
	case RoleViewer:
		return permission == "view_team"
	default:
		return false
	}
}

/**
 * IsActive checks if the team member is active
 */
func (tm TeamMember) IsActive() bool {
	return tm.Status == "active"
}
