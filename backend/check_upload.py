import httpx
import asyncio
import uuid

async def test_upload():
    # We need a teacher token. I'll try to login as teacher first.
    base_url = "http://localhost:8000/api/v1"
    
    async with httpx.AsyncClient(follow_redirects=True) as client:
        # Login
        print("Logging in...")
        login_res = await client.post(f"{base_url}/auth/login", json={
            "urn": "teacher@mastery.ai",
            "password": "password123"
        })
        
        if login_res.status_code != 200:
            print(f"Login failed! Status: {login_res.status_code}")
            print(f"Response Body: {login_res.text}")
            return
            
        token = login_res.json()["access_token"]
        print(f"Login successful! Token starts with: {token[:10]}...")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get Classes to find a valid class_id
        print("Getting classes...")
        # Use trailing slash to avoid redirect
        classes_res = await client.get(f"{base_url}/classes/", headers=headers)
        if classes_res.status_code != 200:
            print(f"Failed to get classes! Status: {classes_res.status_code}")
            print(f"Response Body: {classes_res.text}")
            return
            
        classes = classes_res.json()
        if not classes:
            print("No classes found for teacher. Please seed the DB.")
            return
            
        class_id = classes[0]["id"]
        print(f"Using Class ID: {class_id}")
        
        # Test Upload
        # Title, description, type, class_id are required as Forms
        data = {
            "title": "Test Resource",
            "description": "Test description",
            "type": "pdf",
            "class_id": class_id
        }
        
        # Dummy PDF content
        files = {
            "file": ("test.pdf", b"%PDF-1.4 test content", "application/pdf")
        }
        
        print("Sending POST request to /resources/...")
        try:
            # Use trailing slash to avoid redirect
            response = await client.post(f"{base_url}/resources/", data=data, files=files, headers=headers)
            print(f"Status: {response.status_code}")
            print(f"Response Body: {response.text}")
        except Exception as e:
            print(f"POST failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_upload())
