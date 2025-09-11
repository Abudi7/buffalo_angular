/**
 * Team Actions - Team Management API Endpoints
 *
 * This package provides HTTP handlers for team management operations
 * including team creation, member management, and collaboration features.
 *
 * @author Abud Developer
 * @version 1.0.0
 * @since 2025-09-11
 */
package actions

import (
	"net/http"
	"time"

	"github.com/gobuffalo/buffalo"
	"github.com/gobuffalo/pop/v6"
	"github.com/gofrs/uuid"

	"backend/models"
)

/**
 * CreateTeamRequest represents the request payload for creating a team
 */
type CreateTeamRequest struct {
	Name        string `json:"name" validate:"required,min=3,max=255"`
	Description string `json:"description"`
}

/**
 * InviteMemberRequest represents the request payload for inviting a team member
 */
type InviteMemberRequest struct {
	Email string `json:"email" validate:"required,email"`
	Role  string `json:"role" validate:"required,oneof=admin manager member viewer"`
}

/**
 * UpdateMemberRoleRequest represents the request payload for updating member role
 */
type UpdateMemberRoleRequest struct {
	Role string `json:"role" validate:"required,oneof=admin manager member viewer"`
}

/**
 * CreateTeam creates a new team
 * POST /api/teams
 */
func CreateTeam(c buffalo.Context) error {
	var req CreateTeamRequest
	if err := c.Bind(&req); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		}))
	}

	// Get current user from JWT
	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Create team
	team := &models.Team{
		ID:          uuid.Must(uuid.NewV4()),
		Name:        req.Name,
		Description: req.Description,
		OwnerID:     userID,
		Settings:    "{}",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := tx.Create(team); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to create team",
			"error":   err.Error(),
		}))
	}

	// Add owner as team member
	ownerMember := &models.TeamMember{
		ID:        uuid.Must(uuid.NewV4()),
		TeamID:    team.ID,
		UserID:    userID,
		Role:      models.RoleOwner,
		Status:    "active",
		JoinedAt:  &time.Time{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	*ownerMember.JoinedAt = time.Now()

	if err := tx.Create(ownerMember); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to add owner to team",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusCreated, r.JSON(map[string]interface{}{
		"success": true,
		"data":    team,
		"message": "Team created successfully",
	}))
}

/**
 * GetTeams retrieves all teams for the current user
 * GET /api/teams
 */
func GetTeams(c buffalo.Context) error {
	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Get teams where user is a member
	var teams []models.Team
	query := tx.Q().
		Join("team_members tm", "teams.id = tm.team_id").
		Where("tm.user_id = ? AND tm.status = ?", userID, "active")

	if err := query.All(&teams); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to retrieve teams",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"data":    teams,
		"message": "Teams retrieved successfully",
	}))
}

/**
 * GetPendingInvitations retrieves pending team invitations for the current user
 * GET /api/pending
 */
func GetPendingInvitations(c buffalo.Context) error {
	// For now, return empty array since we don't have invitations implemented yet
	// In a real implementation, this would query the database for user's pending invitations

	pendingInvitations := []map[string]interface{}{}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"data":    pendingInvitations,
		"message": "Pending invitations retrieved successfully",
	}))
}

/**
 * GetTeam retrieves a specific team with members
 * GET /api/teams/{id}
 */
func GetTeam(c buffalo.Context) error {
	teamID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid team ID",
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Check if user is member of team
	var member models.TeamMember
	if err := tx.Where("team_id = ? AND user_id = ? AND status = ?", teamID, userID, "active").First(&member); err != nil {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Access denied",
		}))
	}

	// Get team details
	var team models.Team
	if err := tx.Find(&team, teamID); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Team not found",
		}))
	}

	// Get team members with user details
	var members []struct {
		models.TeamMember
		User models.User `json:"user"`
	}
	query := tx.Q().
		Join("users u", "team_members.user_id = u.id").
		Where("team_members.team_id = ?", teamID).
		Select("team_members.*, u.email, u.created_at as user_created_at")

	if err := query.All(&members); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to retrieve team members",
			"error":   err.Error(),
		}))
	}

	response := map[string]interface{}{
		"team":      team,
		"members":   members,
		"user_role": member.Role,
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"data":    response,
		"message": "Team retrieved successfully",
	}))
}

/**
 * InviteMember invites a user to join the team
 * POST /api/teams/{id}/invite
 */
func InviteMember(c buffalo.Context) error {
	teamID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid team ID",
		}))
	}

	var req InviteMemberRequest
	if err := c.Bind(&req); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Check if user has permission to invite members
	var member models.TeamMember
	if err := tx.Where("team_id = ? AND user_id = ? AND status = ?", teamID, userID, "active").First(&member); err != nil {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Access denied",
		}))
	}

	if !member.HasPermission("invite_members") {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Insufficient permissions",
		}))
	}

	// Find user by email
	var user models.User
	if err := tx.Where("email = ?", req.Email).First(&user); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "User not found",
		}))
	}

	// Check if user is already a member
	var existingMember models.TeamMember
	if err := tx.Where("team_id = ? AND user_id = ?", teamID, user.ID).First(&existingMember); err == nil {
		return c.Render(http.StatusConflict, r.JSON(map[string]interface{}{
			"success": false,
			"message": "User is already a team member",
		}))
	}

	// Create team member invitation
	teamMember := &models.TeamMember{
		ID:        uuid.Must(uuid.NewV4()),
		TeamID:    teamID,
		UserID:    user.ID,
		Role:      models.TeamMemberRole(req.Role),
		Status:    "pending",
		InvitedBy: userID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := tx.Create(teamMember); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to send invitation",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusCreated, r.JSON(map[string]interface{}{
		"success": true,
		"data":    teamMember,
		"message": "Invitation sent successfully",
	}))
}

/**
 * UpdateMemberRole updates a team member's role
 * PUT /api/teams/{id}/members/{member_id}
 */
func UpdateMemberRole(c buffalo.Context) error {
	teamID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid team ID",
		}))
	}

	memberID, err := uuid.FromString(c.Param("member_id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid member ID",
		}))
	}

	var req UpdateMemberRoleRequest
	if err := c.Bind(&req); err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid request data",
			"error":   err.Error(),
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Check if user has permission to manage members
	var userMember models.TeamMember
	if err := tx.Where("team_id = ? AND user_id = ? AND status = ?", teamID, userID, "active").First(&userMember); err != nil {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Access denied",
		}))
	}

	if !userMember.HasPermission("manage_members") {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Insufficient permissions",
		}))
	}

	// Find the member to update
	var member models.TeamMember
	if err := tx.Where("id = ? AND team_id = ?", memberID, teamID).First(&member); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Member not found",
		}))
	}

	// Update role
	member.Role = models.TeamMemberRole(req.Role)
	member.UpdatedAt = time.Now()

	if err := tx.Update(&member); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to update member role",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"data":    member,
		"message": "Member role updated successfully",
	}))
}

/**
 * RemoveMember removes a member from the team
 * DELETE /api/teams/{id}/members/{member_id}
 */
func RemoveMember(c buffalo.Context) error {
	teamID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid team ID",
		}))
	}

	memberID, err := uuid.FromString(c.Param("member_id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid member ID",
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Check if user has permission to manage members
	var userMember models.TeamMember
	if err := tx.Where("team_id = ? AND user_id = ? AND status = ?", teamID, userID, "active").First(&userMember); err != nil {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Access denied",
		}))
	}

	if !userMember.HasPermission("manage_members") {
		return c.Render(http.StatusForbidden, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Insufficient permissions",
		}))
	}

	// Find the member to remove
	var member models.TeamMember
	if err := tx.Where("id = ? AND team_id = ?", memberID, teamID).First(&member); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Member not found",
		}))
	}

	// Prevent removing team owner
	if member.Role == models.RoleOwner {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Cannot remove team owner",
		}))
	}

	// Remove member
	if err := tx.Destroy(&member); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to remove member",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"message": "Member removed successfully",
	}))
}

/**
 * AcceptInvitation accepts a team invitation
 * POST /api/teams/invitations/{id}/accept
 */
func AcceptInvitation(c buffalo.Context) error {
	memberID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid invitation ID",
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Find the invitation
	var member models.TeamMember
	if err := tx.Where("id = ? AND user_id = ? AND status = ?", memberID, userID, "pending").First(&member); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invitation not found",
		}))
	}

	// Accept invitation
	member.Status = "active"
	now := time.Now()
	member.JoinedAt = &now
	member.UpdatedAt = time.Now()

	if err := tx.Update(&member); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to accept invitation",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"data":    member,
		"message": "Invitation accepted successfully",
	}))
}

/**
 * DeclineInvitation declines a team invitation
 * POST /api/teams/invitations/{id}/decline
 */
func DeclineInvitation(c buffalo.Context) error {
	memberID, err := uuid.FromString(c.Param("id"))
	if err != nil {
		return c.Render(http.StatusBadRequest, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invalid invitation ID",
		}))
	}

	userID, ok := c.Value("user_id").(uuid.UUID)
	if !ok {
		return c.Render(http.StatusUnauthorized, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Unauthorized",
		}))
	}

	tx := c.Value("tx").(*pop.Connection)

	// Find the invitation
	var member models.TeamMember
	if err := tx.Where("id = ? AND user_id = ? AND status = ?", memberID, userID, "pending").First(&member); err != nil {
		return c.Render(http.StatusNotFound, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Invitation not found",
		}))
	}

	// Remove invitation
	if err := tx.Destroy(&member); err != nil {
		return c.Render(http.StatusInternalServerError, r.JSON(map[string]interface{}{
			"success": false,
			"message": "Failed to decline invitation",
			"error":   err.Error(),
		}))
	}

	return c.Render(http.StatusOK, r.JSON(map[string]interface{}{
		"success": true,
		"message": "Invitation declined successfully",
	}))
}
