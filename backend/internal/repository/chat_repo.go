package repository

import (
	"customer-help-center-backend/internal/models"

	"gorm.io/gorm"
)

type ChatRepository interface {
	CreateMessage(message *models.ChatMessage) error
	GetMessagesByTicketID(ticketID uint) ([]models.ChatMessage, error)
	MarkMessagesAsRead(messageIDs []uint, adminID uint64) error
	MarkTicketMessagesAsRead(ticketID uint, readerRole string) error
}

type chatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) ChatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) CreateMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *chatRepository) GetMessagesByTicketID(ticketID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	
	// We use a raw query or multiple joins to get sender names efficiently.
	// Since GORM doesn't support polymorphic preloads easily for different tables, 
	// we'll use a JOIN with COALESCE to get the name.
	
	err := r.db.Table("chat_messages").
		Select("chat_messages.*, CASE WHEN chat_messages.sender_type = 'customer' THEN customers.name ELSE (admins.first_name || ' ' || admins.last_name) END as sender_name").
		Joins("LEFT JOIN customers ON customers.id = chat_messages.sender_id AND chat_messages.sender_type = 'customer'").
		Joins("LEFT JOIN admins ON admins.id = chat_messages.sender_id AND chat_messages.sender_type != 'customer'").
		Where("chat_messages.ticket_id = ?", ticketID).
		Order("chat_messages.created_at asc").
		Find(&messages).Error

	if err != nil {
		return nil, err
	}
	return messages, nil
}

func (r *chatRepository) MarkMessagesAsRead(messageIDs []uint, adminID uint64) error {
	// Logic to batch insert into MessageReadStatus or update IsRead flag
	// For simplicity, we just update IsRead on the message itself for now,
	// but the schema suggests a MessageReadStatus table for individual admin tracking.
	// Let's implement the IsRead flag update for the message as a simplified approach first
	// or properly insert ReadStatus.

	// Transaction
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&models.ChatMessage{}).Where("id IN ?", messageIDs).Update("is_read", true).Error; err != nil {
			return err
		}
		// Also create read status entries
		for _, mid := range messageIDs {
			readStatus := models.MessageReadStatus{
				MessageID: mid,
				AdminID:   adminID,
			}
			if err := tx.Create(&readStatus).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *chatRepository) MarkTicketMessagesAsRead(ticketID uint, readerRole string) error {
	if readerRole == "admin" {
		// Admin reads messages sent by customers
		return r.db.Model(&models.ChatMessage{}).
			Where("ticket_id = ? AND sender_type = ? AND is_read = ?", ticketID, "customer", false).
			Update("is_read", true).Error
	} else if readerRole == "customer" {
		// Customer reads messages sent by agents or managers
		return r.db.Model(&models.ChatMessage{}).
			Where("ticket_id = ? AND sender_type IN ? AND is_read = ?", ticketID, []string{"agent", "manager"}, false).
			Update("is_read", true).Error
	}
	return nil
}
