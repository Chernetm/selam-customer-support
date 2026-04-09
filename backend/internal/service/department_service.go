package service

import (
	"customer-help-center-backend/internal/models"
	"customer-help-center-backend/internal/repository"
)

type DepartmentService interface {
	CreateDepartment(req *models.Department) (*models.Department, error)
	GetAllDepartments() ([]models.Department, error)
	GetDepartment(id uint) (*models.Department, error)
	UpdateDepartment(id uint, req *models.Department) (*models.Department, error)
	DeleteDepartment(id uint) error
}

type departmentService struct {
	repo repository.DepartmentRepository
}

func NewDepartmentService(repo repository.DepartmentRepository) DepartmentService {
	return &departmentService{repo: repo}
}

func (s *departmentService) CreateDepartment(req *models.Department) (*models.Department, error) {
	if err := s.repo.Create(req); err != nil {
		return nil, err
	}
	return req, nil
}

func (s *departmentService) GetAllDepartments() ([]models.Department, error) {
	return s.repo.FindAll()
}

func (s *departmentService) GetDepartment(id uint) (*models.Department, error) {
	return s.repo.FindByID(id)
}

func (s *departmentService) UpdateDepartment(id uint, req *models.Department) (*models.Department, error) {
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	existing.Name = req.Name
	existing.Description = req.Description
	existing.Location = req.Location

	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *departmentService) DeleteDepartment(id uint) error {
	return s.repo.Delete(id)
}
