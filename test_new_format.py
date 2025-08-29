#!/usr/bin/env python3
"""
Test script to verify the application works with the new connect.json format
"""
import requests
import json

def test_api_endpoints():
    """Test the API endpoints with the new data format"""
    base_url = "http://localhost:8000"
    
    print("Testing API endpoints with new data format...")
    
    # Test 1: Get all courses
    try:
        response = requests.get(f"{base_url}/api/realtime/courses")
        data = response.json()
        print(f"✓ /api/realtime/courses - Status: {response.status_code}")
        print(f"  Total courses: {len(data.get('data', {}).get('courses', []))}")
        
        # Check if schedule data is present
        if data.get('data', {}).get('courses'):
            sample_course = data['data']['courses'][0]
            has_schedule = 'schedule_data' in sample_course
            print(f"  Schedule data present: {has_schedule}")
            if has_schedule:
                print(f"  Sample course: {sample_course.get('course_code')}")
                if sample_course.get('schedule_data', {}).get('class_schedules'):
                    print(f"  Class schedules: {len(sample_course['schedule_data']['class_schedules'])}")
                    
    except Exception as e:
        print(f"✗ /api/realtime/courses - Error: {e}")
    
    # Test 2: Get specific course
    try:
        response = requests.get(f"{base_url}/api/realtime/courses/CSE330")
        data = response.json()
        print(f"✓ /api/realtime/courses/CSE330 - Status: {response.status_code}")
        
        if 'data' in data and data['data']:
            course = data['data']
            print(f"  Course: {course.get('course_code')} - {course.get('course_title', 'N/A')}")
            has_schedule = 'schedule_data' in course
            print(f"  Schedule data present: {has_schedule}")
            
            if has_schedule and course.get('schedule_data', {}).get('class_schedules'):
                schedules = course['schedule_data']['class_schedules']
                print(f"  Class schedules: {len(schedules)}")
                for schedule in schedules:
                    print(f"    {schedule.get('day')}: {schedule.get('start_time')} - {schedule.get('end_time')}")
                    
            if has_schedule and course.get('schedule_data', {}).get('lab_section'):
                lab = course['schedule_data']['lab_section']
                print(f"  Lab section: {lab.get('lab_course_code')} - {lab.get('lab_room_name')}")
                
    except Exception as e:
        print(f"✗ /api/realtime/courses/CSE330 - Error: {e}")
    
    # Test 3: Search courses
    try:
        response = requests.get(f"{base_url}/api/realtime/search", params={"q": "CSE"})
        data = response.json()
        print(f"✓ /api/realtime/search - Status: {response.status_code}")
        print(f"  Results: {len(data.get('data', []))}")
        
    except Exception as e:
        print(f"✗ /api/realtime/search - Error: {e}")
    
    # Test 4: Get stats
    try:
        response = requests.get(f"{base_url}/api/realtime/stats")
        data = response.json()
        print(f"✓ /api/realtime/stats - Status: {response.status_code}")
        print(f"  Stats: {data.get('data', {})}")
        
    except Exception as e:
        print(f"✗ /api/realtime/stats - Error: {e}")

if __name__ == "__main__":
    test_api_endpoints()