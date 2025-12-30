import os
import datetime
import mimetypes
from typing import Optional, Dict, Any
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload
import logging

logger = logging.getLogger(__name__)

class GoogleService:
    """
    Service for interacting with Google Workspace APIs (Drive, Calendar).
    Uses Service Account credentials.
    """
    
    SCOPES = [
        'https://www.googleapis.com/auth/drive',           # Full Drive access for permissions
        'https://www.googleapis.com/auth/calendar',        # Full Calendar access
        'https://www.googleapis.com/auth/spreadsheets',    # Sheets access (legacy support)
        'https://www.googleapis.com/auth/gmail.send'       # Gmail Send access
    ]
    
    def __init__(self):
        self.creds = None
        self.drive_service = None
        self.calendar_service = None
        self.gmail_service = None
        self.credentials_path = os.path.join(os.getcwd(), 'credentials.json')
        self._authenticate()

    def _authenticate(self):
        """Authenticates with Google APIs using service account."""
        if not os.path.exists(self.credentials_path):
            logger.warning(f"Google credentials not found at {self.credentials_path}")
            return False
            
        try:
            self.creds = Credentials.from_service_account_file(
                self.credentials_path, scopes=self.SCOPES)
            
            self.drive_service = build('drive', 'v3', credentials=self.creds)
            self.calendar_service = build('calendar', 'v3', credentials=self.creds)
            self.gmail_service = build('gmail', 'v1', credentials=self.creds)
            logger.info("Successfully authenticated with Google APIs")
            return True
        except Exception as e:
            logger.error(f"Failed to authenticate with Google APIs: {str(e)}")
            return False

    def upload_file(self, file_obj, filename: str, mime_type: str = None) -> Optional[Dict[str, str]]:
        """
        Uploads a file-like object to Google Drive.
        Returns dict with 'id', 'webViewLink', 'webContentLink'.
        """
        if not self.drive_service:
            if not self._authenticate():
                raise Exception("Google Drive Authentication failed")

        try:
            if not mime_type:
                mime_type, _ = mimetypes.guess_type(filename)
                if not mime_type:
                    mime_type = 'application/octet-stream'

            file_metadata = {'name': filename}
            
            media = MediaIoBaseUpload(
                file_obj, 
                mimetype=mime_type,
                resumable=True
            )
            
            file = self.drive_service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, webViewLink, webContentLink'
            ).execute()
            
            # Make file publicly readable (or accessible to specific domain)
            # For simplicity in this demo, make it public to anyone with link
            self.drive_service.permissions().create(
                fileId=file.get('id'),
                body={'type': 'anyone', 'role': 'reader'}
            ).execute()
            
            logger.info(f"File uploaded to Drive: {filename} ({file.get('id')})")
            return file
            
        except Exception as e:
            logger.error(f"Drive upload failed: {e}")
            raise e

    def create_calendar_event(
        self, 
        summary: str, 
        start_time: datetime.datetime, 
        end_time: datetime.datetime, 
        description: str = "",
        attendees: list = None
    ) -> Optional[Any]:
        """
        Creates an event in the primary calendar.
        start_time and end_time should be datetime objects.
        """
        if not self.calendar_service:
            if not self._authenticate():
                raise Exception("Google Calendar Authentication failed")
            
        try:
            event = {
                'summary': summary,
                'description': description,
                'start': {
                    'dateTime': start_time.isoformat(),
                    'timeZone': 'UTC',
                },
                'end': {
                    'dateTime': end_time.isoformat(),
                    'timeZone': 'UTC',
                },
            }
            
            if attendees:
                event['attendees'] = [{'email': email} for email in attendees]

            event_result = self.calendar_service.events().insert(
                calendarId='primary',
                body=event
            ).execute()
            
            logger.info(f"Calendar event created: {event_result.get('htmlLink')}")
            return event_result
            
        except Exception as e:
            logger.error(f"Calendar event creation failed: {e}")
            raise e

    def send_email(self, to_email: str, subject: str, body: str) -> Optional[Dict[str, Any]]:
        """
        Sends an email using the Gmail API.
        """
        if not self.gmail_service:
            if not self._authenticate():
                raise Exception("Gmail Authentication failed")

        try:
            from email.mime.text import MIMEText
            import base64

            message = MIMEText(body)
            message['to'] = to_email
            message['subject'] = subject
            
            # Encode the message safely
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            sent_message = self.gmail_service.users().messages().send(
                userId="me", 
                body={'raw': raw_message}
            ).execute()
            
            logger.info(f"Email sent to {to_email} (Msg ID: {sent_message['id']})")
            return sent_message

        except Exception as e:
            logger.error(f"Gmail send failed: {e}")
            # Do not raise, just log error mostly to avoid crashing app on notification fail
            return None

# Singleton
google_service = GoogleService()
