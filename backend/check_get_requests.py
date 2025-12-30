import httpx
import asyncio

async def test_teacher_get_requests():
    async with httpx.AsyncClient() as client:
        # Login
        login_resp = await client.post(
            "http://localhost:8000/api/v1/auth/login",
            json={"urn": "TEACHER001", "password": "password123"}
        )
        if login_resp.status_code != 200:
            print(f"Login failed: {login_resp.text}")
            return
        
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get requests
        # Note: Added trailing slash if needed, but router prefix is /resources
        resp = await client.get(
            "http://localhost:8000/api/v1/resources/requests",
            headers=headers
        )
        
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            requests = resp.json()
            print(f"Found {len(requests)} requests for teacher.")
            for r in requests:
                print(f" - {r['title']} (Status: {r['status']})")
        else:
            print(f"Error: {resp.text}")

if __name__ == "__main__":
    asyncio.run(test_teacher_get_requests())
