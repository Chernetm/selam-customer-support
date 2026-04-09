package models

type Case struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	Name         string     `gorm:"not null" json:"name"`
	Description  string     `gorm:"not null" json:"description"`
	DepartmentID uint       `gorm:"not null" json:"departmentId"`
	Priority     string     `gorm:"not null" json:"priority"` // Low, Medium, High, Urgent
	Department   Department `gorm:"foreignKey:DepartmentID" json:"department,omitempty"`
}

// SLA mapping for reference:
// Low:    3–5 days
// Medium: 1–2 days
// High:   24 hours
// Urgent: 2–6 hours
