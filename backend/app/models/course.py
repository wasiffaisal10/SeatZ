from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(Integer, primary_key=True, index=True)
    section_id = Column(Integer, unique=True, index=True, nullable=False)
    course_id = Column(Integer, index=True, nullable=False)
    section_name = Column(String(10), nullable=False)
    course_code = Column(String(20), index=True, nullable=False)
    course_credit = Column(Integer, default=3)
    section_type = Column(String(20), default="OTHER")
    capacity = Column(Integer, nullable=False)
    consumed_seat = Column(Integer, default=0)
    real_time_seat_count = Column(Integer, nullable=False)
    room_name = Column(String(50))
    room_number = Column(String(50))
    faculties = Column(String(100))
    academic_degree = Column(String(20), default="UNDERGRADUATE")
    semester_session_id = Column(Integer, nullable=False)
    
    # Schedule information stored as JSON
    schedule_data = Column(JSON)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_fetched_at = Column(DateTime(timezone=True))
    
    # Relationships
    alerts = relationship("Alert", back_populates="course", cascade="all, delete-orphan")
    
    @property
    def available_seats(self):
        return self.real_time_seat_count
    
    @property
    def is_full(self):
        return self.real_time_seat_count <= 0
    
    @property
    def is_available(self):
        return self.real_time_seat_count > 0
    
    def __repr__(self):
        return f"<Course({self.course_code}-{self.section_name})>"