package service

import (
	"customer-help-center-backend/internal/models"
	"customer-help-center-backend/internal/repository"
	"fmt"
	"gorm.io/gorm"
)

type EscalationService interface {
	Escalate(ticketID uint, reason string, escalatedBy uint64, escalatedTo uint64) error
	GetEscalationsByTicketID(ticketID uint) ([]models.Escalation, error)
	GetEscalationByID(id uint) (*models.Escalation, error)
	UpdateEscalation(esc *models.Escalation) error
	DeleteEscalation(id uint) error
}

type escalationService struct {
	db         *gorm.DB
	repo       repository.EscalationRepository
	ticketRepo repository.TicketRepository
	adminRepo  repository.AdminRepository
	socket     SocketService
}

func NewEscalationService(
	db *gorm.DB,
	repo repository.EscalationRepository,
	ticketRepo repository.TicketRepository,
	adminRepo repository.AdminRepository,
	socket SocketService,
) EscalationService {
	return &escalationService{
		db:         db,
		repo:       repo,
		ticketRepo: ticketRepo,
		adminRepo:  adminRepo,
		socket:     socket,
	}
}

func (s *escalationService) Escalate(ticketID uint, reason string, escalatedBy uint64, escalatedTo uint64) error {
	var ticket *models.Ticket
	err := s.db.Transaction(func(tx *gorm.DB) error {
		txRepo := s.repo.WithTx(tx)
		txTicketRepo := s.ticketRepo.WithTx(tx)
		txAdminRepo := s.adminRepo.WithTx(tx)

		var txErr error
		ticket, txErr = txTicketRepo.FindByID(ticketID, 0)
		if txErr != nil {
			return txErr
		}

		// PERMISSION CHECK: Only the assigned agent can escalate
		if ticket.AgentID == nil || *ticket.AgentID != escalatedBy {
			return fmt.Errorf("unauthorized: only the assigned agent can escalate this ticket")
		}

		// Update ticket status
		ticket.Status = "escalated"

		// Check if an "open" escalation already exists (needed for ActiveTicketQty logic)
		existingEsc, err := txRepo.FindOpenByTicketID(ticketID)
		if err != nil {
			return err
		}

		// 1. Handle ActiveTicketQty for OLD owner
		if existingEsc != nil && existingEsc.EscalatedTo != nil {
			// If already escalated, decrement previous escalated owner's qty
			oldEscOwner, err := txAdminRepo.FindByID(*existingEsc.EscalatedTo)
			if err == nil && oldEscOwner.ActiveTicketQty > 0 {
				oldEscOwner.ActiveTicketQty--
				_ = txAdminRepo.Update(oldEscOwner)
			}
		} else if ticket.AgentID != nil {
			// If not yet escalated, decrement agent's qty
			oldAgent, err := txAdminRepo.FindByID(*ticket.AgentID)
			if err == nil && oldAgent.ActiveTicketQty > 0 {
				oldAgent.ActiveTicketQty--
				_ = txAdminRepo.Update(oldAgent)
			}
		}

		// 2. Fetch target admin to update NEW owner qty
		target, err := txAdminRepo.FindByID(escalatedTo)
		if err == nil && target != nil {
			// 3. Increment NEW owner qty
			target.ActiveTicketQty++
			_ = txAdminRepo.Update(target)
		}

		if err := txTicketRepo.Update(ticket); err != nil {
			return err
		}

		// Use the existingEsc found at the beginning of the transaction
		if existingEsc != nil {
			// Update existing escalation
			existingEsc.Reason = reason
			existingEsc.EscalatedBy = &escalatedBy
			existingEsc.EscalatedTo = &escalatedTo
			
			if err := txRepo.Update(existingEsc); err != nil {
				return fmt.Errorf("failed to update escalation: %w", err)
			}
		} else {
			// Create new escalation record
			esc := &models.Escalation{
				TicketID:    ticketID,
				Reason:      reason,
				EscalatedBy: &escalatedBy,
				EscalatedTo: &escalatedTo,
				Status:      "open",
			}
			if err := txRepo.Create(esc); err != nil {
				return fmt.Errorf("failed to create escalation: %w", err)
			}
		}
		return nil
	})

	// Re-fetch ticket to refresh preloaded associations (Agent, Admin/Manager, etc.)
	refreshedTicket, err := s.ticketRepo.FindByID(ticketID, 0)
	if err == nil {
		ticket = refreshedTicket
	}

	s.socket.Broadcast("ticketEscalated", ticket)

	return nil
}

func (s *escalationService) GetEscalationsByTicketID(ticketID uint) ([]models.Escalation, error) {
	return s.repo.FindByTicketID(ticketID)
}

func (s *escalationService) GetEscalationByID(id uint) (*models.Escalation, error) {
	return s.repo.FindByID(id)
}

func (s *escalationService) UpdateEscalation(esc *models.Escalation) error {
	return s.repo.Update(esc)
}

func (s *escalationService) DeleteEscalation(id uint) error {
	return s.repo.Delete(id)
}
