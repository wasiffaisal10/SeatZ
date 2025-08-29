import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
import os
import logging
from datetime import datetime
from jinja2 import Template

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.app_name = "SeatZ - BRACU Seat Monitor"
    
    def create_seat_available_email(self, user_email: str, course_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Create email content for seat availability notification
        """
        course_code = course_data["course_code"]
        section_name = course_data["section_name"]
        available_seats = course_data["available_seats"]
        capacity = course_data["capacity"]
        
        subject = f"🎓 Seat Available: {course_code} - {section_name}"
        
        # HTML email template
        html_template = Template("""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Seat Available - {{ course_code }}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; }
                .course-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .seat-status { font-size: 24px; font-weight: bold; color: #28a745; }
                .schedule { margin: 20px 0; }
                .schedule-item { padding: 10px; background: #f8f9fa; margin: 5px 0; border-radius: 5px; }
                .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                .btn { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎓 Seat Available!</h1>
                    <p>{{ course_code }} - {{ section_name }}</p>
                </div>
                
                <div class="content">
                    <div class="course-info">
                        <h2>Course Details</h2>
                        <p><strong>Course:</strong> {{ course_code }} - {{ section_name }}</p>
                        <p><strong>Available Seats:</strong> <span class="seat-status">{{ available_seats }}</span></p>
                        <p><strong>Total Capacity:</strong> {{ capacity }}</p>
                        {% if room_name %}
                        <p><strong>Room:</strong> {{ room_name }}</p>
                        {% endif %}
                        {% if faculties %}
                        <p><strong>Faculty:</strong> {{ faculties }}</p>
                        {% endif %}
                    </div>
                    
                    {% if schedule_data %}
                    <div class="schedule">
                        <h3>Class Schedule</h3>
                        {% for schedule in schedule_data.classSchedules %}
                        <div class="schedule-item">
                            <strong>{{ schedule.day.title() }}</strong> - {{ schedule.startTime }} to {{ schedule.endTime }}
                        </div>
                        {% endfor %}
                        
                        {% if schedule_data.finalExamDetail %}
                        <div class="schedule-item">
                            <strong>Final Exam:</strong> {{ schedule_data.finalExamDetail }}
                        </div>
                        {% endif %}
                    </div>
                    {% endif %}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://seatz.vercel.app" class="btn">View All Courses</a>
                        <a href="https://seatz.vercel.app/alerts" class="btn">Manage Alerts</a>
                    </div>
                    
                    <p style="text-align: center; color: #666;">
                        You're receiving this because you're tracking this course on SeatZ. 
                        <a href="https://seatz.vercel.app/unsubscribe?email={{ user_email }}">Unsubscribe</a>
                    </p>
                </div>
                
                <div class="footer">
                    <p>SeatZ - Smart Seat Alerts for BRACU Students</p>
                    <p>This is an automated notification. Please do not reply to this email.</p>
                </div>
            </div>
        </body>
        </html>
        """)
        
        html_content = html_template.render(
            course_code=course_code,
            section_name=section_name,
            available_seats=available_seats,
            capacity=capacity,
            room_name=course_data.get("room_name"),
            faculties=course_data.get("faculties"),
            schedule_data=course_data.get("schedule_data"),
            user_email=user_email
        )
        
        # Plain text version
        text_content = f"""
        Seat Available: {course_code} - {section_name}
        
        Available Seats: {available_seats}
        Total Capacity: {capacity}
        
        Room: {course_data.get('room_name', 'N/A')}
        Faculty: {course_data.get('faculties', 'N/A')}
        
        Visit https://seatz.vercel.app to manage your alerts.
        
        You're receiving this because you're tracking this course on SeatZ.
        """
        
        return {
            "subject": subject,
            "html": html_content,
            "text": text_content
        }
    
    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str) -> bool:
        """
        Send email using SMTP
        """
        try:
            if not all([self.smtp_username, self.smtp_password]):
                logger.error("SMTP credentials not configured")
                return False
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.app_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Attach parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False
    
    async def send_seat_available_alert(self, user_email: str, course_data: Dict[str, Any]) -> bool:
        """
        Send seat availability alert to user
        """
        email_content = self.create_seat_available_email(user_email, course_data)
        
        return await self.send_email(
            to_email=user_email,
            subject=email_content["subject"],
            html_content=email_content["html"],
            text_content=email_content["text"]
        )
    
    async def send_batch_alerts(self, alerts: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Send batch seat availability alerts
        Returns dict with success/failure counts
        """
        results = {"sent": 0, "failed": 0}
        
        # Process alerts in batches to avoid rate limiting
        batch_size = 10
        for i in range(0, len(alerts), batch_size):
            batch = alerts[i:i+batch_size]
            
            tasks = []
            for alert in batch:
                task = self.send_seat_available_alert(
                    alert["user_email"],
                    alert["course_data"]
                )
                tasks.append(task)
            
            # Execute batch
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for result in batch_results:
                if result is True:
                    results["sent"] += 1
                else:
                    results["failed"] += 1
            
            # Small delay between batches
            await asyncio.sleep(1)
        
        logger.info(f"Batch alerts completed: {results}")
        return results

# Global service instance
email_service = EmailService()