package repository

import (
	"customer-help-center-backend/internal/models"
	"fmt"

	"gorm.io/gorm"
)

type TicketRepository interface {
	Create(ticket *models.Ticket) error
	FindByID(id uint, customerID uint) (*models.Ticket, error)
	FindAll(filter map[string]interface{}) ([]models.Ticket, error)
	Update(ticket *models.Ticket) error
	FindActiveTicket(customerID uint, caseID uint) (*models.Ticket, error)
	Delete(id uint) error
	DeleteUnassignedTickets() error
	DeleteAllTickets() error
	CreateMetrics(metrics *models.TicketMetrics) error
	WithTx(tx *gorm.DB) TicketRepository
}

type ticketRepository struct {
	db *gorm.DB
}

func NewTicketRepository(db *gorm.DB) TicketRepository {
	return &ticketRepository{db: db}
}

func (r *ticketRepository) WithTx(tx *gorm.DB) TicketRepository {
	return &ticketRepository{db: tx}
}

func (r *ticketRepository) Create(ticket *models.Ticket) error {
	return r.db.Create(ticket).Error
}

func (r *ticketRepository) FindByID(id uint, customerID uint) (*models.Ticket, error) {
	var ticket models.Ticket
	query := r.db.Preload("Customer").
		Preload("Case").
		Preload("Agent").
		Preload("Escalations.EscalatedToAdmin").
		Preload("Escalations.EscalatedByAdmin").
		Preload("Metrics").
		Preload("Chats", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		})

	if customerID > 0 {
		query = query.Where("customer_id = ?", customerID)
	}

	if err := query.First(&ticket, id).Error; err != nil {
		return nil, err
	}

	// Populate SenderName for chats via bulk fetch
	r.populateSenderNames(ticket.Chats)

	return &ticket, nil
}
func (r *ticketRepository) FindAll(filter map[string]interface{}) ([]models.Ticket, error) {
	fmt.Printf("TicketRepo: FindAll called with filter: %+v\n", filter)
	var tickets []models.Ticket

	query := r.db.Model(&models.Ticket{}).
		Preload("Customer").
		Preload("Case").
		Preload("Chats", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at asc")
		}).
		Preload("Escalations.EscalatedToAdmin").
		Preload("Escalations.EscalatedByAdmin").
		Preload("Agent").
		Preload("Metrics")

	if val, ok := filter["customer_id"]; ok {
		query = query.Where("customer_id = ?", val)
	}

	if val, ok := filter["agent_id"]; ok {
		query = query.Where("agent_id = ?", val)
	}

	if val, ok := filter["manager_id"]; ok {
		// If filtering by manager, join with escalations and look for open escalations
		query = query.Joins("JOIN escalations ON escalations.ticket_id = tickets.id").
			Where("escalations.status = ? AND (escalations.escalated_to = ? OR tickets.agent_id = ?)", "open", val, val)
	}

	if val, ok := filter["any_admin_id"]; ok {
		// Unified filter: Assigned to this admin OR Escalated to this admin
		// Use LEFT JOIN so we don't lose tickets that aren't escalated at all
		query = query.Joins("LEFT JOIN escalations ON escalations.ticket_id = tickets.id AND escalations.status = ?", "open").
			Where("tickets.agent_id = ? OR escalations.escalated_to = ?", val, val).
			Group("tickets.id") // Avoid duplicates from multiple escalations (though there should only be one 'open')
	}

	if val, ok := filter["status"]; ok {
		query = query.Where("status = ?", val)
	}

	if val, ok := filter["start_date"]; ok {
		query = query.Where("created_at >= ?", val)
	}

	if val, ok := filter["end_date"]; ok {
		query = query.Where("created_at <= ?", val)
	}

	// Default ordering - Most recent message/update first (Telegram style)
	// Using a scalar subquery in Order to avoid GROUP BY issues when filtering by various criteria
	query = query.Order("COALESCE((SELECT MAX(created_at) FROM chat_messages WHERE ticket_id = tickets.id), tickets.updated_at) DESC")

	if err := query.Find(&tickets).Error; err != nil {
		return nil, err
	}

	// Populate SenderName for each chat message in each ticket via bulk fetch
	for i := range tickets {
		r.populateSenderNames(tickets[i].Chats)
	}

	return tickets, nil
}

func (r *ticketRepository) Update(ticket *models.Ticket) error {
	return r.db.Save(ticket).Error
}

func (r *ticketRepository) FindActiveTicket(customerID uint, caseID uint) (*models.Ticket, error) {
	var ticket models.Ticket
	// Find ticket for this customer and case that is NOT closed
	err := r.db.Where("customer_id = ? AND case_id = ? AND status != ?", customerID, caseID, "closed").
		Preload("Customer").
		Preload("Case").
		Preload("Agent").
		Preload("Agent").
		Preload("Chats").
		First(&ticket).Error

	if err != nil {
		fmt.Printf("FindActiveTicket: No active ticket found for C:%d Case:%d. Error: %v\n", customerID, caseID, err)
		return nil, err
	}
	fmt.Printf("FindActiveTicket: Found existing ticket ID: %d for C:%d Case:%d\n", ticket.ID, customerID, caseID)
	return &ticket, nil
}
func (r *ticketRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete associations first to avoid foreign key errors
		if err := tx.Where("ticket_id = ?", id).Delete(&models.ChatMessage{}).Error; err != nil {
			return err
		}
		if err := tx.Where("ticket_id = ?", id).Delete(&models.Rating{}).Error; err != nil {
			return err
		}
		if err := tx.Where("ticket_id = ?", id).Delete(&models.TicketMetrics{}).Error; err != nil {
			return err
		}
		if err := tx.Where("id = ?", id).Delete(&models.Ticket{}).Error; err != nil {
			return err
		}
		return nil
	})
}

func (r *ticketRepository) DeleteUnassignedTickets() error {
	var tickets []models.Ticket
	// A ticket is unassigned if AgentID is NULL
	if err := r.db.Where("agent_id IS NULL").Find(&tickets).Error; err != nil {
		return err
	}
	// if err := r.db.Unscoped().Where("1 = 1").Delete(&models.Ticket{}).Error; err != nil {
	// 	return err
	// }
	for _, t := range tickets {
		fmt.Printf("AutoCleanup: Deleting unassigned ticket ID=%d\n", t.ID)
		if err := r.Delete(t.ID); err != nil {
			fmt.Printf("AutoCleanup: Error deleting ticket %d: %v\n", t.ID, err)
		}
	}
	return nil
}
func (r *ticketRepository) DeleteAllTickets() error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Delete associations first
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.MessageReadStatus{}).Error; err != nil {
			return err
		}
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.ChatMessage{}).Error; err != nil {
			return err
		}
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Rating{}).Error; err != nil {
			return err
		}
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.TicketMetrics{}).Error; err != nil {
			return err
		}
		if err := tx.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.Ticket{}).Error; err != nil {
			return err
		}

		// Also reset agent ticket counts? User didn't ask but it's good practice.
		// However, it's safer to just do what's asked.
		return nil
	})
}

func (r *ticketRepository) CreateMetrics(metrics *models.TicketMetrics) error {
	return r.db.Create(metrics).Error
}


func (r *ticketRepository) populateSenderNames(chats []models.ChatMessage) {
	if len(chats) == 0 {
		return
	}

	customerIDs := make(map[uint64]bool)
	adminIDs := make(map[uint64]bool)

	for _, m := range chats {
		if m.SenderType == "customer" {
			customerIDs[m.SenderID] = true
		} else {
			adminIDs[m.SenderID] = true
		}
	}

	customerNameMap := make(map[uint64]string)
	if len(customerIDs) > 0 {
		var ids []uint64
		for id := range customerIDs {
			ids = append(ids, id)
		}
		rows, _ := r.db.Table("customers").Select("id, name").Where("id IN ?", ids).Rows()
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id uint64
				var name string
				rows.Scan(&id, &name)
				customerNameMap[id] = name
			}
		}
	}

	adminNameMap := make(map[uint64]string)
	if len(adminIDs) > 0 {
		var ids []uint64
		for id := range adminIDs {
			ids = append(ids, id)
		}
		rows, _ := r.db.Table("admins").Select("id, first_name || ' ' || last_name as name").Where("id IN ?", ids).Rows()
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id uint64
				var name string
				rows.Scan(&id, &name)
				adminNameMap[id] = name
			}
		}
	}

	for i := range chats {
		m := &chats[i]
		if m.SenderType == "customer" {
			m.SenderName = customerNameMap[m.SenderID]
		} else {
			m.SenderName = adminNameMap[m.SenderID]
		}
	}
}
