package models

import (
	"time"
)

type Escalation struct {
	ID uint `gorm:"primaryKey" json:"id"`

	TicketID uint `gorm:"not null;index" json:"ticketId"`

	// Trigger
	Reason string `gorm:"not null" json:"reason"`

	// Level (L1, L2, etc.)
	Level string `gorm:"type:varchar(10);index" json:"level"`

	// Actors
	EscalatedBy *uint64 `gorm:"column:escalated_by;index" json:"escalatedBy"`
	EscalatedTo *uint64 `gorm:"column:escalated_to;index" json:"escalatedTo"`

	// Status
	Status string `gorm:"size:20;default:'open';index" json:"status"`
	
	// Associations
	EscalatedToAdmin *Admin `gorm:"foreignKey:EscalatedTo" json:"escalatedToAdmin,omitempty"`
	EscalatedByAdmin *Admin `gorm:"foreignKey:EscalatedBy" json:"escalatedByAdmin,omitempty"`

	ResolvedAt *time.Time `json:"resolvedAt"`

	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
}
