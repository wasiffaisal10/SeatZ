import httpx
import asyncio
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.course import Course
import logging

logger = logging.getLogger(__name__)

class BracuConnectService:
    def __init__(self):
        self.base_url = os.getenv("BRACU_API_URL", "https://usis-cdn.eniamza.com/connect.json")
        self.raw_schedule_endpoint = "/raw-schedule"
        self.timeout = 30
    
    async def fetch_course_data(self) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch course data from BRACU Connect API
        Returns list of course dictionaries or None if error
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.base_url}{self.raw_schedule_endpoint}"
                logger.info(f"Fetching course data from: {url}")
                
                response = await client.get(url)
                response.raise_for_status()
                
                data = response.json()
                
                # Handle both new direct array format and old nested format
                if isinstance(data, list):
                    # New format: courses directly in array
                    courses = data
                elif isinstance(data, dict) and data.get("data"):
                    # Old format: courses nested under "data" key
                    courses = data["data"]
                else:
                    logger.warning("No course data found in response")
                    return None
                
                logger.info(f"Successfully fetched {len(courses)} courses")
                return courses
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching course data: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching course data: {e}")
            return None
    
    def process_course_data(self, raw_course: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Process raw course data into database-compatible format
        """
        schedule = raw_course.get("sectionSchedule", {})
        
        # Process lab section data
        if raw_course.get("sectionType") == "LAB":
            # Extract parent course code (e.g., CSE110 from CSE110L)
            parent_code = raw_course["courseCode"].rstrip("L")
            
            # Find parent course and update its schedule with lab data
            parent_course = db.query(Course).filter(
                Course.course_code == parent_code,
                Course.section_type != "LAB"
            ).first()
            
            if parent_course:
                parent_schedule = parent_course.schedule_data or {}
                parent_schedule["labSection"] = {
                    "labSectionId": raw_course["sectionId"],
                    "labCourseCode": raw_course["courseCode"],
                    "labFaculties": raw_course.get("faculties", ""),
                    "labName": raw_course["sectionName"],
                    "labRoomName": raw_course.get("roomName", ""),
                    "labSchedules": {
                        "classSchedules": raw_course.get("sectionSchedule", {}).get("classSchedules", [])
                    }
                }
                parent_course.schedule_data = parent_schedule
                db.commit()
                logger.info(f"Updated lab schedule for {parent_code} with lab section {raw_course['courseCode']}")
            else:
                logger.warning(f"Could not find parent course {parent_code} for lab section {raw_course['courseCode']}")
            return None
            
        # For regular courses, check if this course has a lab section in the raw data
        if raw_course.get("courseCode"):
            lab_course = db.query(Course).filter(
                Course.course_code == raw_course["courseCode"] + "L",
                Course.section_type == "LAB"
            ).first()
            
            if lab_course and lab_course.schedule_data:
                schedule["labSection"] = {
                    "labSectionId": lab_course.section_id,
                    "labCourseCode": lab_course.course_code,
                    "labFaculties": lab_course.faculties,
                    "labName": lab_course.section_name,
                    "labRoomName": lab_course.room_name,
                    "labSchedules": {
                        "classSchedules": lab_course.schedule_data.get("classSchedules", [])
                    }
                }
        
        return {
            "section_id": raw_course["sectionId"],
            "course_id": raw_course["courseId"],
            "section_name": raw_course["sectionName"],
            "course_code": raw_course["courseCode"],
            "course_credit": raw_course["courseCredit"],
            "section_type": raw_course["sectionType"],
            "capacity": raw_course["capacity"],
            "consumed_seat": raw_course["consumedSeat"],
            "real_time_seat_count": raw_course.get("realTimeSeatCount", raw_course["consumedSeat"]),
            "room_name": raw_course.get("roomName"),
            "room_number": raw_course.get("roomNumber"),
            "faculties": raw_course.get("faculties"),
            "academic_degree": raw_course.get("academicDegree", "UNDERGRADUATE"),
            "semester_session_id": raw_course["semesterSessionId"],
            "schedule_data": schedule,
            "last_fetched_at": datetime.now(timezone.utc)
        }
    
    async def sync_courses_to_db(self, db: Session) -> Dict[str, int]:
        """
        Sync course data from BRACU Connect to local database
        Returns dict with sync statistics
        """
        raw_courses = await self.fetch_course_data()
        if not raw_courses:
            return {"added": 0, "updated": 0, "failed": 0}
        
        stats = {"added": 0, "updated": 0, "failed": 0}
        
        for raw_course in raw_courses:
            try:
                processed_data = self.process_course_data(raw_course, db)
                
                # Skip if processed_data is None (lab sections)
                if processed_data is None:
                    continue
                
                # Check if course exists
                existing_course = db.query(Course).filter(
                    Course.section_id == processed_data["section_id"]
                ).first()
                
                if existing_course:
                    # Update existing course
                    for key, value in processed_data.items():
                        setattr(existing_course, key, value)
                    stats["updated"] += 1
                else:
                    # Create new course
                    new_course = Course(**processed_data)
                    db.add(new_course)
                    stats["added"] += 1
                
            except Exception as e:
                logger.error(f"Error processing course {raw_course.get('courseCode', 'unknown')}: {e}")
                stats["failed"] += 1
        
        try:
            db.commit()
            logger.info(f"Course sync completed: {stats}")
        except Exception as e:
            logger.error(f"Database commit failed: {e}")
            db.rollback()
            stats = {"added": 0, "updated": 0, "failed": len(raw_courses)}
        
        return stats
    
    async def get_course_by_code(self, course_code: str, db: Session) -> Optional[Dict[str, Any]]:
        """
        Fetch specific course by course code
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.base_url}{self.raw_schedule_endpoint}"
                response = await client.get(url)
                response.raise_for_status()
                
                data = response.json()
                
                # Handle both new direct array format and old nested format
                if isinstance(data, list):
                    # New format: courses directly in array
                    courses = data
                elif isinstance(data, dict) and data.get("data"):
                    # Old format: courses nested under "data" key
                    courses = data["data"]
                else:
                    courses = []
                
                for course in courses:
                    if course.get("courseCode", "").upper() == course_code.upper():
                        return self.process_course_data(course, db)
                
                return None
                
        except Exception as e:
            logger.error(f"Error fetching course {course_code}: {e}")
            return None

# Global service instance
bracu_service = BracuConnectService()