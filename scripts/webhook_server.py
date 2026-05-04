from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
import uuid
from datetime import datetime

QUEUE_DIR = "/Volumes/Data/Hotel/CapyInn/queue"
FAILED_DIR = os.path.join(QUEUE_DIR, "failed")
LOG_FILE = os.path.join(QUEUE_DIR, "supervisor.log")

def log_event(event_type, message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_line = f"[{timestamp}] [{event_type}] {message}\n"
    print(log_line.strip())
    with open(LOG_FILE, "a") as f:
        f.write(log_line)

class SupervisorHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        
        try:
            payload = json.loads(post_data.decode('utf-8'))
        except:
            payload = {}

        if self.path == '/hook/add_task':
            prompt = payload.get('prompt', '')
            task_type = payload.get('type', 'general') # có thể là 'plan', 'complex'
            
            task_id = str(uuid.uuid4())[:8]
            # Nếu là plan/complex thì đặt tên file chứa từ khóa để Worker ưu tiên Opus 4.7
            prefix = "plan_" if task_type in ['plan', 'complex'] else "task_"
            task_name = f"{prefix}{task_id}.task"
            task_path = os.path.join(QUEUE_DIR, task_name)
            
            with open(task_path, 'w') as f:
                f.write(prompt)
                
            log_event("NEW_TASK", f"Tiếp nhận Task: {task_name} (Level: {task_type})")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "queued", "task": task_name}).encode('utf-8'))
            
        elif self.path == '/hook/task_done':
            task_name = payload.get('task')
            log_event("SUCCESS", f"Task hoàn tất: {task_name}. Sẵn sàng luân chuyển Agent tiếp theo (như QA).")
            # Tại đây có thể code thêm logic để đẩy kết quả sang agent QA kiểm tra
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "acknowledged"}).encode('utf-8'))
            
        elif self.path == '/hook/task_failed':
            task_name = payload.get('task')
            log_event("ALERT", f"Task thất bại toàn tập (4 lần Rate Limit/Lỗi): {task_name}. Cần Admin/Agent Override!")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "logged_failure"}).encode('utf-8'))
            
        else:
            self.send_response(404)
            self.end_headers()

def run_supervisor(server_class=HTTPServer, handler_class=SupervisorHandler, port=8080):
    os.makedirs(QUEUE_DIR, exist_ok=True)
    os.makedirs(FAILED_DIR, exist_ok=True)
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    log_event("STARTUP", f"👁️ Agent Supervisor (Orchestrator) đang theo dõi và điều phối tại port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
    log_event("SHUTDOWN", "Supervisor đã tắt.")

if __name__ == '__main__':
    run_supervisor()
