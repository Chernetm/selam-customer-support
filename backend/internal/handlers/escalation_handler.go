package handlers

import (
	"customer-help-center-backend/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type EscalationHandler struct {
	service service.EscalationService
}

func NewEscalationHandler(s service.EscalationService) *EscalationHandler {
	return &EscalationHandler{service: s}
}

func (h *EscalationHandler) CreateEscalation(c *gin.Context) {
	var req struct {
		TicketID    uint   `json:"ticketId" binding:"required"`
		Reason      string `json:"reason" binding:"required"`
		EscalatedTo uint64 `json:"escalatedTo" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	adminID, exists := c.Get("admin_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	if err := h.service.Escalate(req.TicketID, req.Reason, adminID.(uint64), req.EscalatedTo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ticket escalated successfully"})
}

func (h *EscalationHandler) GetEscalations(c *gin.Context) {
	ticketIDStr := c.Param("ticketId")
	ticketID, err := strconv.Atoi(ticketIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ticket ID"})
		return
	}

	escalations, err := h.service.GetEscalationsByTicketID(uint(ticketID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, escalations)
}

func (h *EscalationHandler) GetEscalationByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid escalation ID"})
		return
	}

	escalation, err := h.service.GetEscalationByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Escalation not found"})
		return
	}

	c.JSON(http.StatusOK, escalation)
}
