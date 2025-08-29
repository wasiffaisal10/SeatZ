from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.course import Course
from app.schemas import Course as CourseSchema, CourseWithStatus, ApiResponse
from app.services.bracu_service import bracu_service

router = APIRouter(prefix="/api/courses", tags=["courses"])

@router.get("/", response_model=List[CourseWithStatus])
async def get_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    course_code: Optional[str] = Query(None),
    available_only: Optional[bool] = Query(None),
    section_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all courses with optional filtering"""
    query = db.query(Course)
    
    if course_code:
        query = query.filter(Course.course_code.ilike(f"%{course_code}%"))
    
    if search:
        # For search parameter, prioritize exact matches for course codes
        if search.upper().startswith("CSE") and search.upper().isalnum():
            # First try exact match for course codes like CSE110
            exact_matches = query.filter(Course.course_code == search.upper()).all()
            if exact_matches:
                return exact_matches
            # Then try starts with match
            query = query.filter(Course.course_code.startswith(search.upper()))
        else:
            # For other searches, use the existing partial match
            query = query.filter(Course.course_code.ilike(f"%{search}%"))
    
    if available_only is True:
        query = query.filter(Course.real_time_seat_count > 0)
    elif available_only is False:
        query = query.filter(Course.real_time_seat_count <= 0)
    
    # Always filter out lab sections as they are now embedded in parent courses
    query = query.filter(Course.section_type != 'LAB')
    
    courses = query.offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseWithStatus)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Get a specific course by ID"""
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.get("/code/{course_code}", response_model=List[CourseWithStatus])
async def get_courses_by_code(course_code: str, db: Session = Depends(get_db)):
    """Get all sections for a specific course code"""
    courses = db.query(Course).filter(
        Course.course_code.ilike(course_code)
    ).all()
    return courses

@router.get("/search/")
async def search_courses(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Search courses by course code or name"""
    query = db.query(Course)
    
    # Prioritize exact matches for course codes like CSE110
    if q.upper().startswith("CSE") and q.upper().isalnum():
        # First try exact match
        exact_matches = query.filter(Course.course_code == q.upper()).all()
        if exact_matches:
            return {
                "query": q,
                "results": len(exact_matches),
                "courses": exact_matches
            }
        # Then try starts with match
        query = query.filter(Course.course_code.startswith(q.upper()))
    else:
        # For other searches, use partial match
        query = query.filter(Course.course_code.ilike(f"%{q}%"))
    
    courses = query.limit(limit).all()
    return {
        "query": q,
        "results": len(courses),
        "courses": courses
    }

@router.get("/stats/overview")
async def get_course_stats(db: Session = Depends(get_db)):
    """Get course statistics overview"""
    total_courses = db.query(Course).count()
    available_courses = db.query(Course).filter(Course.real_time_seat_count > 0).count()
    full_courses = total_courses - available_courses
    
    return {
        "total_courses": total_courses,
        "available_courses": available_courses,
        "full_courses": full_courses,
        "availability_rate": round((available_courses / total_courses * 100), 2) if total_courses > 0 else 0
    }