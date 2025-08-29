from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.bracu_service import bracu_service
from app.schemas import ApiResponse
import logging

router = APIRouter(prefix="/api/sync", tags=["sync"])
logger = logging.getLogger(__name__)

@router.post("/courses", response_model=ApiResponse)
async def sync_courses(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Sync courses from BRACU Connect (manual trigger)"""
    try:
        # Run sync in background to avoid timeout
        background_tasks.add_task(bracu_service.sync_courses_to_db, db)
        
        return ApiResponse(
            success=True,
            message="Course sync started in background"
        )
    except Exception as e:
        logger.error(f"Error starting course sync: {e}")
        raise HTTPException(status_code=500, detail="Failed to start sync")

@router.post("/courses/sync-now", response_model=ApiResponse)
async def sync_courses_now(db: Session = Depends(get_db)):
    """Sync courses from BRACU Connect immediately (blocking)"""
    try:
        stats = await bracu_service.sync_courses_to_db(db)
        
        return ApiResponse(
            success=True,
            message="Course sync completed",
            data=stats
        )
    except Exception as e:
        logger.error(f"Error syncing courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync courses")

@router.get("/status")
async def get_sync_status(db: Session = Depends(get_db)):
    """Get sync status and last sync time"""
    from sqlalchemy import func
    from app.models.course import Course
    
    # Get the most recent course update
    latest_course = db.query(Course).order_by(Course.last_fetched_at.desc()).first()
    
    total_courses = db.query(Course).count()
    
    return {
        "total_courses": total_courses,
        "last_sync": latest_course.last_fetched_at if latest_course else None,
        "sync_enabled": True
    }