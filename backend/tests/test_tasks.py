import pytest
from datetime import datetime, timedelta

def test_create_task(client, auth_headers):
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high",
        "status": "todo",
        "due_date": (datetime.now() + timedelta(days=1)).isoformat()
    }
    
    response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == task_data["title"]
    assert data["description"] == task_data["description"]
    assert "id" in data

def test_get_tasks(client, auth_headers):
    # Create a task first
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high",
        "status": "todo",
        "due_date": (datetime.now() + timedelta(days=1)).isoformat()
    }
    client.post("/api/tasks", json=task_data, headers=auth_headers)
    
    # Get all tasks
    response = client.get("/api/tasks", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["title"] == task_data["title"]

def test_update_task(client, auth_headers):
    # Create a task first
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high",
        "status": "todo",
        "due_date": (datetime.now() + timedelta(days=1)).isoformat()
    }
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Update the task
    update_data = {
        "title": "Updated Task",
        "status": "in_progress"
    }
    response = client.patch(f"/api/tasks/{task_id}", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == update_data["title"]
    assert data["status"] == update_data["status"]

def test_delete_task(client, auth_headers):
    # Create a task first
    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "high",
        "status": "todo",
        "due_date": (datetime.now() + timedelta(days=1)).isoformat()
    }
    create_response = client.post("/api/tasks", json=task_data, headers=auth_headers)
    task_id = create_response.json()["id"]
    
    # Delete the task
    response = client.delete(f"/api/tasks/{task_id}", headers=auth_headers)
    assert response.status_code == 204
    
    # Verify task is deleted
    get_response = client.get(f"/api/tasks/{task_id}", headers=auth_headers)
    assert get_response.status_code == 404
