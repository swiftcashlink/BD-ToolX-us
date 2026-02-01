from flask import Flask, jsonify, request
from flask_cors import CORS
import schedule
import time
import threading
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

# In-memory storage for automation tasks
automation_tasks = {}

class AutomationWorker:
    def __init__(self):
        self.running = False
        
    def post_to_instagram(self, content, hashtags):
        """Simulate Instagram posting"""
        print(f"[Instagram] Posting: {content}")
        print(f"Hashtags: {hashtags}")
        # Real Instagram Graph API calls would be implemented here
        return {"success": True, "post_id": f"ig_{datetime.now().timestamp()}"}
    
    def engage_with_content(self, platform, action, count):
        """Simulate engagement actions"""
        results = []
        for i in range(count):
            results.append({
                "action": action,
                "platform": platform,
                "timestamp": datetime.now().isoformat(),
                "success": True
            })
        print(f"[{platform}] Simulated {count} {action} actions.")
        return results
    
    def schedule_task(self, task_id, task_type, config):
        """Schedule an automation task"""
        def job():
            print(f"Executing scheduled task: {task_id} ({task_type})")
            if task_type == "social" or task_type == "post":
                self.post_to_instagram(
                    config.get("content", ""),
                    config.get("hashtags", [])
                )
            elif task_type == "engagement" or task_type == "engage":
                self.engage_with_content(
                    config.get("platform", "instagram"),
                    config.get("action", "like"),
                    config.get("count", 10)
                )
        
        # Schedule based on config
        freq = config.get("schedule", "daily")
        if freq == "daily":
            schedule.every().day.at("09:00").do(job).tag(task_id)
        elif freq == "hourly":
            schedule.every().hour.do(job).tag(task_id)
        elif freq == "custom":
            schedule.every(5).minutes.do(job).tag(task_id)
        
        automation_tasks[task_id] = {
            "job": job,
            "config": config,
            "status": "scheduled",
            "type": task_type,
            "created_at": datetime.now().isoformat()
        }
        
        return {"success": True, "task_id": task_id}

worker = AutomationWorker()

@app.route('/api/automation/create', methods=['POST'])
def create_automation():
    data = request.json
    task_id = f"task_{int(datetime.now().timestamp())}"
    
    result = worker.schedule_task(
        task_id,
        data.get("type", "post"),
        data.get("config", {})
    )
    
    return jsonify(result)

@app.route('/api/automation/status', methods=['GET'])
def get_status():
    return jsonify({
        "active_tasks_count": len(automation_tasks),
        "tasks": [
            {
                "id": tid, 
                "status": t["status"], 
                "type": t["type"],
                "created_at": t["created_at"]
            } for tid, t in automation_tasks.items()
        ],
        "worker_running": worker.running
    })

@app.route('/api/automation/run-now/<task_id>', methods=['POST'])
def run_now(task_id):
    if task_id in automation_tasks:
        # Run the job manually
        automation_tasks[task_id]["job"]()
        return jsonify({"success": True, "message": f"Task {task_id} executed manually"})
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/automation/stop/<task_id>', methods=['POST'])
def stop_task(task_id):
    if task_id in automation_tasks:
        schedule.clear(task_id)
        del automation_tasks[task_id]
        return jsonify({"success": True, "message": f"Task {task_id} stopped and unscheduled"})
    return jsonify({"error": "Task not found"}), 404

@app.route('/api/automation/delete/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    if task_id in automation_tasks:
        schedule.clear(task_id)
        del automation_tasks[task_id]
        return jsonify({"success": True, "message": f"Task {task_id} deleted"})
    return jsonify({"error": "Task not found"}), 404

def run_scheduler():
    """Background scheduler thread"""
    worker.running = True
    print("Automation Worker thread started...")
    while worker.running:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    # Start scheduler in background thread
    scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
    scheduler_thread.start()
    
    # Run Flask app on port 5001
    print("Automation Server running on port 5001...")
    app.run(port=5001, debug=False)
