import os
import datetime
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
import logging

# Configure logging
logger = logging.getLogger(__name__)

class GoogleSheetsService:
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    
    def __init__(self):
        self.creds = None
        self.service = None
        self.credentials_path = os.path.join(os.getcwd(), 'credentials.json')
        
    def _authenticate(self):
        """Authenticates with Google Sheets API using service account credentials."""
        if not os.path.exists(self.credentials_path):
            logger.warning(f"Google Sheets credentials not found at {self.credentials_path}")
            return False
            
        try:
            self.creds = Credentials.from_service_account_file(
                self.credentials_path, scopes=self.SCOPES)
            self.service = build('sheets', 'v4', credentials=self.creds)
            return True
        except Exception as e:
            logger.error(f"Failed to authenticate with Google Sheets: {str(e)}")
            return False

    def sync_attendance(self, spreadsheet_id: str, date: str, records: list):
        """
        Syncs attendance records to a Google Sheet.
        
        Args:
            spreadsheet_id: The ID of the Google Sheet.
            date: The date of attendance (YYYY-MM-DD).
            records: List of dicts containing student data and status.
        """
        if not self.service:
            if not self._authenticate():
                raise Exception("Google Sheets authentication failed. Please check credentials.json.")

        try:
            sheet = self.service.spreadsheets()
            
            # Check if a sheet for the current month/date (or just "Attendance") exists
            # For simplicity, we'll append to a single "Attendance Log" sheet
            # formatting date to be more readable
            formatted_date = date 
            
            # Prepare rows
            rows = []
            now = datetime.datetime.now().isoformat()
            
            for record in records:
                rows.append([
                    formatted_date,
                    record.get('studentId', ''),
                    record.get('studentName', ''), # Frontend should send this
                    record.get('status', 'unmarked'),
                    record.get('markedAt', ''),
                    now # Sync Timestamp
                ])

            # Range to append to (assuming Sheet1 or similar)
            range_name = 'Sheet1!A1' 
            
            body = {
                'values': rows
            }
            
            result = sheet.values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            logger.info(f"{result.get('updates').get('updatedCells')} cells appended.")
            return True
            
        except Exception as e:
            logger.error(f"Error syncing to Google Sheet: {str(e)}")
            raise e

# Singleton instance
sheets_service = GoogleSheetsService()
