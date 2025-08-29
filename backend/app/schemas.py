from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email_notifications_enabled: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    email_notifications_enabled: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Course schemas
class CourseBase(BaseModel):
    section_id: int
    course_id: int
    section_name: str
    course_code: str
    course_credit: int = 3
    section_type: str = "OTHER"
    capacity: int
    consumed_seat: int = 0
    real_time_seat_count: int
    room_name: Optional[str] = None
    room_number: Optional[str] = None
    faculties: Optional[str] = None
    academic_degree: str = "UNDERGRADUATE"
    semester_session_id: int
    schedule_data: Optional[Dict[str, Any]] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    real_time_seat_count: Optional[int] = None
    consumed_seat: Optional[int] = None
    schedule_data: Optional[Dict[str, Any]] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_fetched_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CourseWithStatus(Course):
    available_seats: int
    is_full: bool
    is_available: bool

# Alert schemas
class AlertBase(BaseModel):
    user_id: int
    course_id: int
    notification_interval_minutes: int = Field(ge=1, le=1440, default=30)

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    notification_interval_minutes: Optional[int] = Field(ge=1, le=1440, default=None)
    is_active: Optional[bool] = None

class Alert(AlertBase):
    id: int
    is_active: bool
    last_notification_sent: Optional[datetime] = None
    notification_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class AlertWithDetails(Alert):
    user: User
    course: Course
    should_notify: bool
    course_has_seats: bool

# API response schemas
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None

class SeatStatusResponse(BaseModel):
    course_code: str
    section_name: str
    available_seats: int
    capacity: int
    last_updated: datetime
    class_schedules: Optional[List[Dict[str, Any]]] = None