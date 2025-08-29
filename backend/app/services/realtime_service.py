import httpx
import asyncio
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class RealtimeService:
    def __init__(self):
        self.base_url = "https://usis-cdn.eniamza.com/connect.json"
        self.timeout = 30
    
    async def fetch_realtime_courses(self) -> Optional[List[Dict[str, Any]]]:
        """
        Fetch real-time course data directly from BRACU Connect API
        No caching, no storage - direct API access
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                logger.info(f"Fetching real-time course data from: {self.base_url}")
                
                response = await client.get(self.base_url)
                response.raise_for_status()
                
                data = response.json()
                
                # Handle both new direct array format and old nested format
                if isinstance(data, list):
                    courses = data
                elif isinstance(data, dict) and data.get("data"):
                    courses = data["data"]
                else:
                    logger.warning("No course data found in response")
                    return []
                
                logger.info(f"Successfully fetched {len(courses)} courses in real-time")
                return courses
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching real-time course data: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error fetching real-time course data: {e}")
            return []
    
    def transform_course_data(self, raw_course: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform raw API data into simplified format including schedule data
        """
        # Extract schedule data
        schedule_data = raw_course.get("sectionSchedule", {}) or {}
        lab_schedules = raw_course.get("labSchedules", []) or []
        
        # Transform class schedules
        class_schedules = []
        if schedule_data and schedule_data.get("classSchedules"):
            for schedule in schedule_data["classSchedules"]:
                if schedule:
                    class_schedules.append({
                        "day": schedule.get("day"),
                        "start_time": schedule.get("startTime"),
                        "end_time": schedule.get("endTime")
                    })
        
        # Transform lab schedules
        lab_schedules_transformed = []
        for lab in lab_schedules:
            if lab:
                lab_schedules_transformed.append({
                    "day": lab.get("day"),
                    "start_time": lab.get("startTime"),
                    "end_time": lab.get("endTime")
                })
        
        # Handle lab section data
        lab_section = None
        if raw_course.get("labSectionId"):
            lab_section = {
                "lab_name": raw_course.get("labName"),
                "lab_course_code": raw_course.get("labCourseCode"),
                "lab_room_name": raw_course.get("labRoomName"),
                "lab_faculties": raw_course.get("labFaculties"),
                "lab_schedules": {
                    "class_schedules": lab_schedules_transformed
                }
            }
        
        return {
            "section_id": raw_course.get("sectionId"),
            "course_id": raw_course.get("courseId"),
            "section_name": raw_course.get("sectionName"),
            "course_code": raw_course.get("courseCode"),
            "course_credit": raw_course.get("courseCredit"),
            "section_type": raw_course.get("sectionType"),
            "capacity": raw_course.get("capacity", 0),
            "consumed_seat": raw_course.get("consumedSeat", 0),
            "available_seats": raw_course.get("capacity", 0) - raw_course.get("consumedSeat", 0),
            "room_name": raw_course.get("roomName"),
            "room_number": raw_course.get("roomNumber"),
            "faculties": raw_course.get("faculties"),
            "prerequisite_courses": raw_course.get("prerequisiteCourses"),
            "schedule_data": {
                "class_schedules": class_schedules,
                "class_start_date": schedule_data.get("classStartDate"),
                "class_end_date": schedule_data.get("classEndDate"),
                "mid_exam_date": schedule_data.get("midExamDate"),
                "mid_exam_start_time": schedule_data.get("midExamStartTime"),
                "mid_exam_end_time": schedule_data.get("midExamEndTime"),
                "final_exam_date": schedule_data.get("finalExamDate"),
                "final_exam_start_time": schedule_data.get("finalExamStartTime"),
                "final_exam_end_time": schedule_data.get("finalExamEndTime"),
                "lab_section": lab_section
            },
            "last_updated": datetime.now().isoformat()
        }
    
    async def get_courses(self) -> List[Dict[str, Any]]:
        """
        Get all courses in real-time, transformed for immediate use
        """
        raw_courses = await self.fetch_realtime_courses()
        if not raw_courses:
            return []
        
        transformed_courses = []
        for course in raw_courses:
            try:
                transformed_course = self.transform_course_data(course)
                if transformed_course:
                    transformed_courses.append(transformed_course)
            except Exception as e:
                logger.error(f"Error transforming course {course.get('courseCode', 'unknown')}: {e}")
                continue
        
        return transformed_courses
    
    async def get_course_by_code(self, course_code: str) -> Optional[Dict[str, Any]]:
        """
        Get specific course by course code in real-time
        """
        raw_courses = await self.fetch_realtime_courses()
        if not raw_courses:
            return None
        
        for course in raw_courses:
            if course.get("courseCode", "").upper() == course_code.upper():
                return self.transform_course_data(course)
        
        return None
    
    async def search_courses(self, query: str) -> List[Dict[str, Any]]:
        """
        Search courses in real-time without storage
        """
        raw_courses = await self.fetch_realtime_courses()
        if not raw_courses:
            return []
        
        results = []
        query_upper = query.upper()
        
        for course in raw_courses:
            course_code = course.get("courseCode", "").upper()
            course_name = course.get("sectionName", "").upper()
            
            if query_upper in course_code or query_upper in course_name:
                results.append(self.transform_course_data(course))
        
        return results

# Global service instance
realtime_service = RealtimeService()