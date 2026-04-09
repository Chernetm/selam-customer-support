package repository

import (
	"customer-help-center-backend/internal/models"
	"gorm.io/gorm"
)

type EscalationRepository interface {
	Create(esc *models.Escalation) error
	FindByID(id uint) (*models.Escalation, error)
	FindByTicketID(ticketID uint) ([]models.Escalation, error)
	FindOpenByTicketID(ticketID uint) (*models.Escalation, error)
	Update(esc *models.Escalation) error
	Delete(id uint) error
	WithTx(tx *gorm.DB) EscalationRepository
}

type escalationRepository struct {
	db *gorm.DB
}

func NewEscalationRepository(db *gorm.DB) EscalationRepository {
	return &escalationRepository{db: db}
}

func (r *escalationRepository) WithTx(tx *gorm.DB) EscalationRepository {
	return &escalationRepository{db: tx}
}

func (r *escalationRepository) Create(esc *models.Escalation) error {
	return r.db.Create(esc).Error
}

func (r *escalationRepository) FindByID(id uint) (*models.Escalation, error) {
	var esc models.Escalation
	if err := r.db.First(&esc, id).Error; err != nil {
		return nil, err
	}
	return &esc, nil
}

func (r *escalationRepository) FindByTicketID(ticketID uint) ([]models.Escalation, error) {
	var escs []models.Escalation
	if err := r.db.Where("ticket_id = ?", ticketID).Find(&escs).Error; err != nil {
		return nil, err
	}
	return escs, nil
}

func (r *escalationRepository) FindOpenByTicketID(ticketID uint) (*models.Escalation, error) {
	var esc models.Escalation
	if err := r.db.Where("ticket_id = ? AND status = ?", ticketID, "open").First(&esc).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &esc, nil
}

func (r *escalationRepository) Update(esc *models.Escalation) error {
	// Using Select("*") ensures all fields are included in the update
	err := r.db.Model(esc).Select("*").Updates(esc).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *escalationRepository) Delete(id uint) error {
	return r.db.Delete(&models.Escalation{}, id).Error
}
