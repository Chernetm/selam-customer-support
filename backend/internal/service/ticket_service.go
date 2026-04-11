package service

import (
	"customer-help-center-backend/internal/models"
	"customer-help-center-backend/internal/repository"
	"errors"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type TicketService interface {
	CreateTicket(ticket *models.Ticket) (*models.Ticket, error)
	GetTicketByID(id uint, customerID uint) (*models.Ticket, error)
	GetCustomerTickets(customerID uint, search string) ([]models.Ticket, error)
	GetAgentTickets(agentID uint64, search string) ([]models.Ticket, error)
	GetManagerTickets(managerID uint64) ([]models.Ticket, error)
	GetAllTickets(search string) ([]models.Ticket, error)
	CloseTicket(id uint, closedBy uint64, summary string) (*models.Ticket, error)
	ReassignTicket(ticketID uint, newAgentID uint64, adminID uint64, reason string) error
	EscalateTicket(ticketID uint, managerID uint64, escalatedBy uint64, reason string) error
	GetTicketReports(startDate, endDate time.Time) (*models.ReportResponse, error)
	InviteInPerson(id uint, adminID uint64) (*models.Ticket, error)
	
	CreateRating(ticketID uint, customerID uint, score int, comment string) (*models.Rating, error)
	GetRating(ticketID uint, customerID uint) (*models.Rating, error)
	
	DeleteTicket(id uint, customerID uint) error
	CleanUnassignedTickets() error
	DeleteAllTickets() error
}

type ticketService struct {
	db         *gorm.DB
	repo       repository.TicketRepository
	caseRepo   repository.CaseRepository
	adminRepo  repository.AdminRepository
	ratingRepo repository.RatingRepository
	chatRepo   repository.ChatRepository
	escRepo    repository.EscalationRepository
	socket     SocketService
}

func NewTicketService(
	db *gorm.DB,
	repo repository.TicketRepository,
	caseRepo repository.CaseRepository,
	adminRepo repository.AdminRepository,
	ratingRepo repository.RatingRepository,
	chatRepo   repository.ChatRepository,
	escRepo    repository.EscalationRepository,
	socket     SocketService,
) TicketService {
	return &ticketService{
		db:         db,
		repo:       repo,
		caseRepo:   caseRepo,
		adminRepo:  adminRepo,
		ratingRepo: ratingRepo,
		chatRepo:   chatRepo,
		escRepo:    escRepo,
		socket:     socket,
	}
}

// ////////////////////////////////////////////////////////////
// CREATE TICKET
// ////////////////////////////////////////////////////////////

func (s *ticketService) CreateTicket(ticket *models.Ticket) (*models.Ticket, error) {
	if ticket.CustomerID == 0 {
		return nil, errors.New("customer ID required")
	}

	// Prevent duplicate active ticket
	existing, _ := s.repo.FindActiveTicket(ticket.CustomerID, ticket.CaseID)
	if existing != nil {
		return existing, nil
	}

	caseObj, err := s.caseRepo.FindByID(ticket.CaseID)
	if err != nil {
		return nil, errors.New("case not found")
	}

	agent, _ := s.adminRepo.FindAvailableAgent(caseObj.Department.Name)
	if agent == nil {
		return nil, errors.New("no available agent")
	}

	agentID := uint64(agent.ID)
	ticket.AgentID = &agentID
	ticket.Status = "assigned"

	if err := s.repo.Create(ticket); err != nil {
		return nil, err
	}

	// Initialize metrics
	metrics := &models.TicketMetrics{
		TicketID: ticket.ID,
	}
	_ = s.repo.CreateMetrics(metrics)

	agent.ActiveTicketQty++
	_ = s.adminRepo.Update(agent)

	createdTicket, err := s.repo.FindByID(ticket.ID, 0)
	if err != nil {
		return ticket, nil
	}

	// Notify agent
	adminRoom := fmt.Sprintf("admin_%d", *createdTicket.AgentID)
	s.socket.Emit(adminRoom, "ticketAssigned", createdTicket)

	return createdTicket, nil
}

// ////////////////////////////////////////////////////////////
// REASSIGN TICKET
// ////////////////////////////////////////////////////////////

func (s *ticketService) ReassignTicket(ticketID uint, newAgentID uint64, adminID uint64, reason string) error {
	var ticket *models.Ticket
	var oldOwnerID *uint64

	err := s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txAdminRepo := s.adminRepo.WithTx(tx)
		txEscRepo := s.escRepo.WithTx(tx)

		var innerErr error
		ticket, innerErr = txRepo.FindByID(ticketID, 0)
		if innerErr != nil {
			return innerErr
		}

		// Check if it's already escalated
		existingEsc, innerErr := txEscRepo.FindOpenByTicketID(ticketID)
		if innerErr == nil && existingEsc != nil {
			// 1. Handle ActiveTicketQty for OLD ESCALATED owner
			if existingEsc.EscalatedTo != nil {
				oldOwnerID = existingEsc.EscalatedTo
				oldEscOwner, err := txAdminRepo.FindByID(*existingEsc.EscalatedTo)
				if err == nil && oldEscOwner.ActiveTicketQty > 0 {
					oldEscOwner.ActiveTicketQty--
					_ = txAdminRepo.Update(oldEscOwner)
				}
			}

			// 2. Update Escalation table
			existingEsc.EscalatedTo = &newAgentID
			if reason != "" {
				existingEsc.Reason = reason
			}
			if err := txEscRepo.Update(existingEsc); err != nil {
				return err
			}

			// 3. Increment NEW owner qty
			target, err := txAdminRepo.FindByID(newAgentID)
			if err == nil && target != nil {
				target.ActiveTicketQty++
				_ = txAdminRepo.Update(target)
			}
			
			// We DO NOT change ticket.AgentID or ticket.Status here
			return nil
		}

		// --- Standard reassignment (NOT escalated) ---

		// 1. Handle ActiveTicketQty for OLD owner
		if ticket.AgentID != nil {
			oldOwnerID = ticket.AgentID
			oldAgent, innerErr := txAdminRepo.FindByID(*ticket.AgentID)
			if innerErr == nil && oldAgent.ActiveTicketQty > 0 {
				oldAgent.ActiveTicketQty--
				_ = txAdminRepo.Update(oldAgent)
			}
		}

		// 2. Update status and AgentID
		ticket.AgentID = &newAgentID
		ticket.Status = "assigned"

		if innerErr := txRepo.Update(ticket); innerErr != nil {
			return innerErr
		}

		// 3. Create Escalation record if reason provided
		if reason != "" {
			esc := &models.Escalation{
				TicketID:    ticketID,
				Reason:      reason,
				EscalatedBy: &adminID,
				EscalatedTo: &newAgentID,
				Status:      "open",
			}
			if err := txEscRepo.Create(esc); err != nil {
				return err
			}
			// Mark ticket as escalated
			ticket.Status = "escalated"
			_ = txRepo.Update(ticket)
		}

		// 3. Increment NEW agent qty
		target, innerErr := txAdminRepo.FindByID(newAgentID)
		if innerErr == nil && target != nil {
			target.ActiveTicketQty++
			_ = txAdminRepo.Update(target)
		}

		return nil
	})

	if err != nil {
		return err
	}

	// Re-fetch ticket to refresh associations (Agent, Admin, etc.)
	refreshedTicket, err := s.repo.FindByID(ticketID, 0)
	if err == nil {
		ticket = refreshedTicket
	}

	// Notify new agent
	adminRoom := fmt.Sprintf("admin_%d", newAgentID)
	s.socket.Emit(adminRoom, "ticketAssigned", ticket)

	// Notify old agent
	if oldOwnerID != nil && *oldOwnerID != newAgentID {
		oldAdminRoom := fmt.Sprintf("admin_%d", *oldOwnerID)
		s.socket.Emit(oldAdminRoom, "ticketUnassigned", ticketID)
	}

	return nil
}

func (s *ticketService) EscalateTicket(ticketID uint, managerID uint64, escalatedBy uint64, reason string) error {
	var ticket *models.Ticket
	var oldOwnerID *uint64

	err := s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txAdminRepo := s.adminRepo.WithTx(tx)
		txEscRepo := s.escRepo.WithTx(tx)

		var innerErr error
		ticket, innerErr = txRepo.FindByID(ticketID, 0)
		if innerErr != nil {
			return errors.New("ticket not found")
		}

		// PERMISSION CHECK: Only the assigned agent can escalate
		if ticket.AgentID == nil || *ticket.AgentID != escalatedBy {
			return errors.New("unauthorized: only the assigned agent can escalate this ticket")
		}

		existingEsc, innerErr := txEscRepo.FindOpenByTicketID(ticketID)
		if innerErr != nil {
			return innerErr
		}

		// 1. Handle ActiveTicketQty for OLD owner
		if existingEsc != nil && existingEsc.EscalatedTo != nil {
			oldOwnerID = existingEsc.EscalatedTo
			// If already escalated, decrement previous escalated owner's qty
			oldEscOwner, err := txAdminRepo.FindByID(*existingEsc.EscalatedTo)
			if err == nil && oldEscOwner.ActiveTicketQty > 0 {
				oldEscOwner.ActiveTicketQty--
				_ = txAdminRepo.Update(oldEscOwner)
			}
		} else if ticket.AgentID != nil {
			oldOwnerID = ticket.AgentID
			// If not yet escalated, decrement agent's qty
			oldAgent, err := txAdminRepo.FindByID(*ticket.AgentID)
			if err == nil && oldAgent.ActiveTicketQty > 0 {
				oldAgent.ActiveTicketQty--
				_ = txAdminRepo.Update(oldAgent)
			}
		}

		// 2. Fetch target admin to update NEW owner qty
		target, innerErr := txAdminRepo.FindByID(managerID)
		if innerErr == nil && target != nil {
			// 3. Increment NEW owner qty
			target.ActiveTicketQty++
			_ = txAdminRepo.Update(target)
		}

		ticket.Status = "escalated"
		if innerErr := txRepo.Update(ticket); innerErr != nil {
			return innerErr
		}

		if existingEsc != nil {
			// Update existing escalation record
			existingEsc.Reason = reason
			existingEsc.EscalatedBy = &escalatedBy
			existingEsc.EscalatedTo = &managerID
			if innerErr := txEscRepo.Update(existingEsc); innerErr != nil {
				return fmt.Errorf("failed to update escalation: %w", innerErr)
			}
		} else {
			// Create new escalation record
			esc := &models.Escalation{
				TicketID:    ticketID,
				Reason:      reason,
				EscalatedBy: &escalatedBy,
				EscalatedTo: &managerID,
				Status:      "open",
			}
			if innerErr := txEscRepo.Create(esc); innerErr != nil {
				return fmt.Errorf("failed to create escalation: %w", innerErr)
			}
		}
		return nil
	})

	if err != nil {
		return err
	}

	// Re-fetch ticket to refresh associations (Agent, Admin/Manager, etc.)
	refreshedTicket, err := s.repo.FindByID(ticketID, 0)
	if err == nil {
		ticket = refreshedTicket
	}

	// Notify manager
	managerRoom := fmt.Sprintf("admin_%d", managerID)
	s.socket.Emit(managerRoom, "ticketEscalated", ticket)

	// Notify old owner
	if oldOwnerID != nil && *oldOwnerID != managerID {
		oldAdminRoom := fmt.Sprintf("admin_%d", *oldOwnerID)
		s.socket.Emit(oldAdminRoom, "ticketUnassigned", ticketID)
	}
	
	return nil
}

// ////////////////////////////////////////////////////////////
// CLOSE TICKET
// ////////////////////////////////////////////////////////////

func (s *ticketService) CloseTicket(id uint, closedBy uint64, summary string) (*models.Ticket, error) {
	ticket, err := s.repo.FindByID(id, 0)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	isAgent := ticket.AgentID != nil && *ticket.AgentID == closedBy
	
	// Check if user is the one it's currently escalated to
	isEscalatedOwner := false
	for _, esc := range ticket.Escalations {
		if esc.Status == "open" && esc.EscalatedTo != nil && *esc.EscalatedTo == closedBy {
			isEscalatedOwner = true
			break
		}
	}

	if !isAgent && !isEscalatedOwner {
		return nil, errors.New("unauthorized: not assigned to this ticket")
	}

	ticket.Status = "closed"
	ticket.ResolutionSummary = summary
	ticket.ClosedBy = &closedBy
	now := time.Now()
	if ticket.Metrics != nil {
		ticket.Metrics.ResolvedAt = &now
	}

	if err := s.repo.Update(ticket); err != nil {
		return nil, err
	}

	// Decrement active ticket quantity for the person who closed it (if they were the owner)
	closer, err := s.adminRepo.FindByID(closedBy)
	if err == nil && closer != nil && closer.ActiveTicketQty > 0 {
		closer.ActiveTicketQty--
		_ = s.adminRepo.Update(closer)
	}

	room := fmt.Sprintf("ticket-%d", id)
	s.socket.Emit(room, "ticketClosed", id)

	return ticket, nil
}

// ////////////////////////////////////////////////////////////
// INVITE IN-PERSON
// ////////////////////////////////////////////////////////////

func (s *ticketService) InviteInPerson(id uint, adminID uint64) (*models.Ticket, error) {
	ticket, err := s.repo.FindByID(id, 0)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	// Permission check: Only assigned agent or escalated owner can invite
	isAgent := ticket.AgentID != nil && *ticket.AgentID == adminID
	isEscalatedOwner := false
	for _, esc := range ticket.Escalations {
		if esc.Status == "open" && esc.EscalatedTo != nil && *esc.EscalatedTo == adminID {
			isEscalatedOwner = true
			break
		}
	}

	if !isAgent && !isEscalatedOwner {
		return nil, errors.New("unauthorized: move restricted to assigned officers")
	}

	// Generate 8-character code
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
		time.Sleep(1 * time.Nanosecond) // Ensure slightly different nanosecs for randomness
	}

	ticket.Status = "in-person"
	ticket.InviteCode = string(b)
	exp := time.Now().Add(5 * 24 * time.Hour)
	ticket.InviteExpiresAt = &exp

	if err := s.repo.Update(ticket); err != nil {
		return nil, err
	}

	// Notify room
	room := fmt.Sprintf("ticket-%d", id)
	s.socket.Emit(room, "ticketUpdated", ticket)

	return ticket, nil
}

// ////////////////////////////////////////////////////////////
// GETTERS
// ////////////////////////////////////////////////////////////

func (s *ticketService) GetTicketByID(id uint, customerID uint) (*models.Ticket, error) {
	return s.repo.FindByID(id, customerID)
}

func (s *ticketService) GetCustomerTickets(customerID uint, search string) ([]models.Ticket, error) {
	return s.repo.FindAll(map[string]interface{}{
		"customer_id": customerID,
		"search":      search,
	})
}

func (s *ticketService) GetAgentTickets(agentID uint64, search string) ([]models.Ticket, error) {
	return s.repo.FindAll(map[string]interface{}{
		"any_admin_id": agentID,
		"search":       search,
	})
}

func (s *ticketService) GetManagerTickets(managerID uint64) ([]models.Ticket, error) {
	return s.repo.FindAll(map[string]interface{}{
		"manager_id": managerID,
	})
}

func (s *ticketService) GetAllTickets(search string) ([]models.Ticket, error) {
	return s.repo.FindAll(map[string]interface{}{
		"search": search,
	})
}

func (s *ticketService) GetTicketReports(startDate, endDate time.Time) (*models.ReportResponse, error) {
	tickets, err := s.repo.FindAll(map[string]interface{}{
		"start_date": startDate,
		"end_date":   endDate,
	})
	if err != nil {
		return nil, err
	}

	var reportTickets []models.TicketReport
	summary := models.ReportSummary{}
	uniqueCustomers := make(map[uint]bool)
	var totalResponseTime time.Duration
	ticketsWithResponse := 0

	for _, t := range tickets {
		agentName := "Unassigned"
		if t.Agent != nil {
			agentName = fmt.Sprintf("%s %s", t.Agent.FirstName, t.Agent.LastName)
		}

		escalatedTo := ""
		escalationReason := ""
		// Find active escalation if any
		for _, e := range t.Escalations {
			if e.Status == "open" {
				if e.EscalatedToAdmin != nil {
					escalatedTo = fmt.Sprintf("%s %s", e.EscalatedToAdmin.FirstName, e.EscalatedToAdmin.LastName)
				}
				escalationReason = e.Reason
				summary.EscalatedTickets++
				break
			}
		}

		// Update Summary
		summary.TotalTickets++
		if t.Status == "closed" {
			summary.ClosedTickets++
		} else if t.Status == "assigned" || t.Status == "open" {
			summary.OpenTickets++
		}
		uniqueCustomers[t.CustomerID] = true

		var firstResponseAt *time.Time
		var resolvedAt *time.Time

		if t.Metrics != nil {
			firstResponseAt = t.Metrics.FirstResponseAt
			resolvedAt = t.Metrics.ResolvedAt

			if firstResponseAt != nil {
				totalResponseTime += firstResponseAt.Sub(t.CreatedAt)
				ticketsWithResponse++
			}
		}

		reportTickets = append(reportTickets, models.TicketReport{
			ID:               t.ID,
			Subject:          t.ComplaintDescription,
			CustomerName:     t.Customer.Name,
			Company:          t.Company,
			TicketStatus:     t.Status,
			CaseName:         t.Case.Name,
			AgentName:        agentName,
			EscalatedTo:      escalatedTo,
			EscalationReason: escalationReason,
			CreatedAt:        t.CreatedAt,
			FirstResponseAt:  firstResponseAt,
			ResolvedAt:       resolvedAt,
		})
	}

	summary.ServedCustomers = len(uniqueCustomers)
	if ticketsWithResponse > 0 {
		summary.AvgResponseTime = totalResponseTime.Hours() / float64(ticketsWithResponse)
	}

	return &models.ReportResponse{
		Tickets: reportTickets,
		Summary: summary,
	}, nil
}

// ////////////////////////////////////////////////////////////
// RATING
// ////////////////////////////////////////////////////////////

func (s *ticketService) CreateRating(ticketID uint, customerID uint, score int, comment string) (*models.Rating, error) {
	ticket, err := s.repo.FindByID(ticketID, 0)
	if err != nil {
		return nil, errors.New("ticket not found")
	}

	if ticket.Status != "closed" {
		return nil, errors.New("ticket not closed")
	}

	existing, _ := s.ratingRepo.FindByTicketID(ticketID)
	if existing != nil {
		return nil, errors.New("rating already exists")
	}

	rating := &models.Rating{
		TicketID:   ticketID,
		CustomerID: customerID,
		Score:      score,
		Comment:    comment,
	}

	if err := s.ratingRepo.Create(rating); err != nil {
		return nil, err
	}

	return rating, nil
}

func (s *ticketService) GetRating(ticketID uint, customerID uint) (*models.Rating, error) {
	return s.ratingRepo.FindByTicketID(ticketID)
}

// ////////////////////////////////////////////////////////////
// DELETE
// ////////////////////////////////////////////////////////////

func (s *ticketService) DeleteTicket(id uint, customerID uint) error {
	ticket, err := s.repo.FindByID(id, customerID)
	if err != nil {
		return errors.New("ticket not found")
	}

	if ticket.AgentID != nil && *ticket.AgentID > 0 {
		return errors.New("cannot delete assigned ticket")
	}

	return s.repo.Delete(id)
}

func (s *ticketService) CleanUnassignedTickets() error {
	return s.repo.DeleteUnassignedTickets()
}

func (s *ticketService) DeleteAllTickets() error {
	return s.repo.DeleteAllTickets()
}
