from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Interval
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import timedelta
from .base import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    
    # Notification settings
    notification_interval_minutes = Column(Integer, default=30)  # minutes between notifications
    is_active = Column(Boolean, default=True)
    
    # Tracking notification history
    last_notification_sent = Column(DateTime(timezone=True))
    notification_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="alerts")
    course = relationship("Course", back_populates="alerts")
    
    @property
    def should_notify(self):
        """Check if enough time has passed since last notification"""
        if not self.last_notification_sent:
            return True
        
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        interval = timedelta(minutes=self.notification_interval_minutes)
        
        return now - self.last_notification_sent >= interval
    
    @property
    def course_has_seats(self):
        """Check if the course currently has available seats"""
        return self.course.is_available
    
    def mark_notified(self):
        """Update last notification time and increment count"""
        from datetime import datetime, timezone
        self.last_notification_sent = datetime.now(timezone.utc)
        self.notification_count += 1
    
    def __repr__(self):
        return f"<Alert(user={self.user.email}, course={self.course.course_code}-{self.course.section_name})>"