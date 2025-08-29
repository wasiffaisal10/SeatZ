import httpx
import json
from app.services.realtime_service import RealtimeService

async def debug_schedule():
    service = RealtimeService()
    
    # Fetch raw data
    raw_courses = await service.fetch_realtime_courses()
    print(f"Found {len(raw_courses)} courses")
    
    # Find a course with schedule data
    for course in raw_courses:
        if course.get("courseCode") == "ACT201" and course.get("sectionSchedule"):
            print("\n=== RAW COURSE DATA ===")
            print(json.dumps(course, indent=2))
            
            print("\n=== TRANSFORMED DATA ===")
            transformed = service.transform_course_data(course)
            print(json.dumps(transformed, indent=2))
            break
    else:
        print("No ACT201 with schedule data found")
        
        # Show first course with schedule data
        for course in raw_courses:
            if course.get("sectionSchedule"):
                print(f"\n=== FIRST COURSE WITH SCHEDULE: {course.get('courseCode')} ===")
                print(json.dumps(course.get("sectionSchedule"), indent=2))
                
                transformed = service.transform_course_data(course)
                print("\n=== TRANSFORMED DATA ===")
                print(json.dumps(transformed.get("schedule_data"), indent=2))
                break

if __name__ == "__main__":
    import asyncio
    asyncio.run(debug_schedule())