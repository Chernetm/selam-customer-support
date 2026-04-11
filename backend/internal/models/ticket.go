package models

import (
	"time"
)

type TicketMetrics struct {
	ID uint `gorm:"primaryKey" json:"id"`

	TicketID uint `gorm:"uniqueIndex;not null" json:"ticketId"`

	// SLA tracking
	FirstResponseAt *time.Time `gorm:"index" json:"firstResponseAt"`
	ResolvedAt      *time.Time `gorm:"index" json:"resolvedAt"`

	// Cached SLA result (for fast queries)
	SlaBreached bool `gorm:"default:false;index" json:"slaBreached"`

	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`
}


type Ticket struct {
	ID uint `gorm:"primaryKey" json:"id"`

	// Core رواب
	CustomerID uint `gorm:"not null;index" json:"customerId"`
	CaseID     uint `gorm:"not null;index" json:"caseId"`

	// Domain-specific (consider moving to Customer if reusable)
	TinNumber    string `json:"tinNumber"`
	NumberOfPads int    `json:"numberOfPads"`
	Region       string `json:"region"`
	ReceiptType  string `json:"receiptType"`
	Company              string `json:"company"`
	ComplaintDescription string `json:"complaintDescription"`

	// Assignment
	AgentID   *uint64 `gorm:"index" json:"agentId"`

	// Status
	Status string `gorm:"type:varchar(20);default:'open';index" json:"status"`

	// SLA (only deadline stays here)
	DeadlineAt *time.Time `gorm:"index" json:"deadlineAt"`

	// In-Person Invitation
	InviteCode      string     `json:"inviteCode"`
	InviteExpiresAt *time.Time `json:"inviteExpiresAt"`

	// Closure
	ResolutionSummary string `json:"resolutionSummary"`
	ClosedBy          *uint64  `json:"closedBy"`

	// Relations
	Escalations []Escalation   `gorm:"foreignKey:TicketID" json:"escalations,omitempty"`
	Metrics     *TicketMetrics `gorm:"foreignKey:TicketID" json:"metrics,omitempty"`

	Customer Customer      `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	Chats    []ChatMessage `gorm:"foreignKey:TicketID" json:"chats,omitempty"`
	Agent    *Admin        `gorm:"foreignKey:AgentID" json:"agent,omitempty"`
	Ratings  []Rating      `gorm:"foreignKey:TicketID" json:"ratings,omitempty"`
	Case     Case          `gorm:"foreignKey:CaseID" json:"case,omitempty"`

	// Meta
	CreatedAt time.Time `gorm:"autoCreateTime" json:"createdAt"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
}

type TicketReport struct {
	ID                uint      `json:"id"`
	Subject           string    `json:"subject"`
	CustomerName      string    `json:"customerName"`
	Company           string    `json:"company"`
	TicketStatus      string    `json:"ticketStatus"`
	CaseName          string    `json:"caseName"`
	AgentName         string    `json:"agentName"`
	EscalatedTo       string    `json:"escalatedTo,omitempty"`
	EscalationReason  string    `json:"escalationReason,omitempty"`
	CreatedAt         time.Time `json:"createdAt"`
	FirstResponseAt   *time.Time `json:"firstResponseAt,omitempty"`
	ResolvedAt        *time.Time `json:"resolvedAt,omitempty"`
}

type ReportSummary struct {
	TotalTickets     int     `json:"totalTickets"`
	ClosedTickets    int     `json:"closedTickets"`
	EscalatedTickets int     `json:"escalatedTickets"`
	OpenTickets      int     `json:"openTickets"`
	ServedCustomers  int     `json:"servedCustomers"`
	AvgResponseTime  float64 `json:"avgResponseTime"` // in hours
}

type ReportResponse struct {
	Tickets []TicketReport `json:"tickets"`
	Summary ReportSummary  `json:"summary"`
}
