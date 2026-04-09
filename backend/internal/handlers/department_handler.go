package handlers

import (
	"net/http"

	"customer-help-center-backend/internal/models"
	"customer-help-center-backend/internal/service"

	"github.com/gin-gonic/gin"
)

type DepartmentHandler struct {
	service service.DepartmentService
}

func NewDepartmentHandler(s service.DepartmentService) *DepartmentHandler {
	return &DepartmentHandler{service: s}
}

// CreateDepartment godoc
// @Summary Create a new department
// @Description Create a new department
// @Tags departments
// @Accept json
// @Produce json
// @Param department body models.Department true "Department"
// @Success 200 {object} models.Department
// @Router /departments [post]
func (h *DepartmentHandler) CreateDepartment(c *gin.Context) {
	var req models.Department
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	newDept, err := h.service.CreateDepartment(&req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create department"})
		return
	}

	c.JSON(http.StatusOK, newDept)
}

// GetDepartments godoc
// @Summary Get all departments
// @Description Get all departments
// @Tags departments
// @Produce json
// @Success 200 {array} models.Department
// @Router /departments [get]
func (h *DepartmentHandler) GetDepartments(c *gin.Context) {
	depts, err := h.service.GetAllDepartments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch departments"})
		return
	}

	c.JSON(http.StatusOK, depts)
}

// GetDepartment godoc
// @Summary Get a department by ID
// @Description Get a department by ID
// @Tags departments
// @Produce json
// @Param id path int true "Department ID"
// @Success 200 {object} models.Department
// @Router /departments/{id} [get]
func (h *DepartmentHandler) GetDepartment(c *gin.Context) {
	var id struct {
		ID uint `uri:"id" binding:"required"`
	}
	if err := c.ShouldBindUri(&id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := h.service.GetDepartment(id.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Department not found"})
		return
	}

	c.JSON(http.StatusOK, res)
}

// UpdateDepartment godoc
// @Summary Update a department
// @Description Update a department
// @Tags departments
// @Accept json
// @Produce json
// @Param id path int true "Department ID"
// @Param department body models.Department true "Department"
// @Success 200 {object} models.Department
// @Router /departments/{id} [put]
func (h *DepartmentHandler) UpdateDepartment(c *gin.Context) {
	var id struct {
		ID uint `uri:"id" binding:"required"`
	}
	if err := c.ShouldBindUri(&id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var req models.Department
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := h.service.UpdateDepartment(id.ID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update department"})
		return
	}

	c.JSON(http.StatusOK, updated)
}

// DeleteDepartment godoc
// @Summary Delete a department
// @Description Delete a department
// @Tags departments
// @Param id path int true "Department ID"
// @Success 200 {object} map[string]string
// @Router /departments/{id} [delete]
func (h *DepartmentHandler) DeleteDepartment(c *gin.Context) {
	var id struct {
		ID uint `uri:"id" binding:"required"`
	}
	if err := c.ShouldBindUri(&id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.DeleteDepartment(id.ID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete department"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Department deleted successfully"})
}
