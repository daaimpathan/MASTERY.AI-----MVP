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
        # Check environment variable first (preferred for Render)
        env_creds = os.environ.get('GOOGLE_SHEETS_CREDENTIALS')
        
        try:
            if env_creds:
                import json
                creds_dict = json.loads(env_creds)
                self.creds = Credentials.from_service_account_info(creds_dict, scopes=self.SCOPES)
                logger.info("Authenticated with Google Sheets using environment variable.")
            elif os.path.exists(self.credentials_path):
                self.creds = Credentials.from_service_account_file(
                    self.credentials_path, scopes=self.SCOPES)
                logger.info(f"Authenticated with Google Sheets using file: {self.credentials_path}")
            else:
                logger.warning(f"Google Sheets credentials not found in ENV or at {self.credentials_path}")
                return False
                
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
                # Error out instead of silent mock so user knows why it's blank
                raise Exception("Google Sheets credentials not found. Please follow Section 5 in deployment_fix.md to add GOOGLE_SHEETS_CREDENTIALS to Render.")

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
