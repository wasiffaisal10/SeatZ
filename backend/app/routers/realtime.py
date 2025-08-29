from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.services.realtime_service import realtime_service
from app.schemas import ApiResponse
import logging

router = APIRouter(prefix="/api/realtime", tags=["realtime"])
logger = logging.getLogger(__name__)

@router.get("/courses", response_model=ApiResponse)
async def get_realtime_courses():
    """Get all courses directly from BRACU Connect API (real-time)"""
    try:
        courses = await realtime_service.get_courses()
        timestamp = courses[0]["last_updated"] if courses and len(courses) > 0 else None
        return ApiResponse(
            success=True,
            message=f"Retrieved {len(courses)} courses in real-time",
            data={
                "courses": courses,
                "total": len(courses),
                "timestamp": timestamp
            }
        )
    except Exception as e:
        logger.error(f"Error fetching real-time courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch real-time course data")

@router.get("/courses/{course_code}", response_model=ApiResponse)
async def get_realtime_course(course_code: str):
    """Get specific course by course code directly from API"""
    try:
        course = await realtime_service.get_course_by_code(course_code)
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
        
        return ApiResponse(
            success=True,
            message="Course retrieved successfully",
            data=course
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching real-time course {course_code}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch course data")

@router.get("/search", response_model=ApiResponse)
async def search_realtime_courses(
    q: str = Query(..., min_length=2, description="Search query for course code or name")
):
    """Search courses directly from API without storage"""
    try:
        courses = await realtime_service.search_courses(q)
        return ApiResponse(
            success=True,
            message=f"Found {len(courses)} matching courses",
            data={
                "query": q,
                "results": len(courses),
                "courses": courses
            }
        )
    except Exception as e:
        logger.error(f"Error searching real-time courses: {e}")
        raise HTTPException(status_code=500, detail="Failed to search courses")

@router.get("/stats", response_model=ApiResponse)
async def get_realtime_stats():
    """Get real-time statistics from API"""
    try:
        logger.info("Fetching real-time stats")
        courses = await realtime_service.get_courses()
        logger.info(f"Got {len(courses)} courses for stats calculation")
        total_courses = len(courses)
        available_courses = len([c for c in courses if c["available_seats"] > 0])
        full_courses = total_courses - available_courses
        
        stats_data = {
            "total_courses": total_courses,
            "available_courses": available_courses,
            "full_courses": full_courses,
            "availability_rate": round((available_courses / total_courses * 100), 2) if total_courses > 0 else 0,
            "timestamp": courses[0]["last_updated"] if courses and len(courses) > 0 else None
        }
        
        logger.info(f"Returning stats: {stats_data}")
        
        return ApiResponse(
            success=True,
            message="Real-time statistics retrieved",
            data=stats_data
        )
    except Exception as e:
        logger.error(f"Error fetching real-time stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")