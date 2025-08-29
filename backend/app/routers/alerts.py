from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.alert import Alert
from app.models.user import User
from app.models.course import Course
from app.schemas import Alert as AlertSchema, AlertCreate, AlertUpdate, AlertWithDetails, ApiResponse
from app.services.email_service import email_service

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

@router.post("/", response_model=AlertSchema)
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Create a new alert for course tracking"""
    # Check if user exists
    user = db.query(User).filter(User.id == alert.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if course exists
    course = db.query(Course).filter(Course.id == alert.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check if alert already exists
    existing_alert = db.query(Alert).filter(
        Alert.user_id == alert.user_id,
        Alert.course_id == alert.course_id
    ).first()
    
    if existing_alert:
        raise HTTPException(status_code=400, detail="Alert already exists for this course")
    
    db_alert = Alert(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.get("/", response_model=List[AlertWithDetails])
async def get_alerts(
    user_id: int = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all alerts with optional filtering"""
    query = db.query(Alert)
    
    if user_id:
        query = query.filter(Alert.user_id == user_id)
    
    if active_only:
        query = query.filter(Alert.is_active == True)
    
    alerts = query.all()
    
    # Enhance alerts with computed properties
    enhanced_alerts = []
    for alert in alerts:
        alert_dict = {
            **AlertSchema.from_orm(alert).dict(),
            "user": alert.user,
            "course": alert.course,
            "should_notify": alert.should_notify,
            "course_has_seats": alert.course_has_seats
        }
        enhanced_alerts.append(AlertWithDetails(**alert_dict))
    
    return enhanced_alerts

@router.get("/{alert_id}", response_model=AlertWithDetails)
async def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Get a specific alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert_dict = {
        **AlertSchema.from_orm(alert).dict(),
        "user": alert.user,
        "course": alert.course,
        "should_notify": alert.should_notify,
        "course_has_seats": alert.course_has_seats
    }
    return AlertWithDetails(**alert_dict)

@router.put("/{alert_id}", response_model=AlertSchema)
async def update_alert(alert_id: int, alert_update: AlertUpdate, db: Session = Depends(get_db)):
    """Update an alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    update_data = alert_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)
    
    db.commit()
    db.refresh(alert)
    return alert

@router.delete("/{alert_id}", response_model=ApiResponse)
async def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    """Delete an alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    
    return ApiResponse(
        success=True,
        message="Alert deleted successfully"
    )

@router.get("/user/{user_id}", response_model=List[AlertWithDetails])
async def get_user_alerts(user_id: int, db: Session = Depends(get_db)):
    """Get all alerts for a specific user"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    alerts = db.query(Alert).filter(Alert.user_id == user_id).all()
    
    enhanced_alerts = []
    for alert in alerts:
        alert_dict = {
            **AlertSchema.from_orm(alert).dict(),
            "user": alert.user,
            "course": alert.course,
            "should_notify": alert.should_notify,
            "course_has_seats": alert.course_has_seats
        }
        enhanced_alerts.append(AlertWithDetails(**alert_dict))
    
    return enhanced_alerts

@router.post("/check-and-notify")
async def check_and_send_notifications(db: Session = Depends(get_db)):
    """Check for seat availability and send notifications (admin endpoint)"""
    from sqlalchemy.orm import joinedload
    
    # Get all active alerts
    alerts = db.query(Alert).options(
        joinedload(Alert.user),
        joinedload(Alert.course)
    ).filter(Alert.is_active == True).all()
    
    notifications_to_send = []
    
    for alert in alerts:
        if alert.should_notify and alert.course_has_seats:
            notifications_to_send.append({
                "user_email": alert.user.email,
                "course_data": {
                    "course_code": alert.course.course_code,
                    "section_name": alert.course.section_name,
                    "available_seats": alert.course.available_seats,
                    "capacity": alert.course.capacity,
                    "room_name": alert.course.room_name,
                    "faculties": alert.course.faculties,
                    "schedule_data": alert.course.schedule_data
                }
            })
            
            # Mark as notified
            alert.mark_notified()
    
    if notifications_to_send:
        # Send batch notifications
        results = await email_service.send_batch_alerts(notifications_to_send)
        
        # Commit changes after successful notifications
        db.commit()
        
        return ApiResponse(
            success=True,
            message=f"Processed {len(notifications_to_send)} notifications",
            data=results
        )
    
    return ApiResponse(
        success=True,
        message="No notifications to send",
        data={"sent": 0, "failed": 0}
    )