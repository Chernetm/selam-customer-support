package repository

import (
	"customer-help-center-backend/internal/models"
	"gorm.io/gorm"
)

type DepartmentRepository interface {
	Create(d *models.Department) error
	FindAll() ([]models.Department, error)
	FindByID(id uint) (*models.Department, error)
	Update(d *models.Department) error
	Delete(id uint) error
}

type departmentRepository struct {
	db *gorm.DB
}

func NewDepartmentRepository(db *gorm.DB) DepartmentRepository {
	return &departmentRepository{db: db}
}

func (r *departmentRepository) Create(d *models.Department) error {
	return r.db.Create(d).Error
}

func (r *departmentRepository) FindAll() ([]models.Department, error) {
	var departments []models.Department
	err := r.db.Find(&departments).Error
	return departments, err
}

func (r *departmentRepository) FindByID(id uint) (*models.Department, error) {
	var d models.Department
	err := r.db.First(&d, id).Error
	return &d, err
}

func (r *departmentRepository) Update(d *models.Department) error {
	return r.db.Save(d).Error
}

func (r *departmentRepository) Delete(id uint) error {
	return r.db.Delete(&models.Department{}, id).Error
}
