#!/bin/bash
# auto_worker.sh: Xử lý hàng đợi task với Fallback & Ưu tiên Claude Opus 4.7

QUEUE_DIR="/Volumes/Data/Hotel/CapyInn/queue"
PROCESSED_DIR="/Volumes/Data/Hotel/CapyInn/queue/processed"
FAILED_DIR="/Volumes/Data/Hotel/CapyInn/queue/failed"
BACKUP_DIR="/Volumes/Data/Hotel/CapyInn/queue/backup_$(date +%Y%m%d)"

mkdir -p "$QUEUE_DIR" "$PROCESSED_DIR" "$FAILED_DIR" "$BACKUP_DIR"

echo "🚀 Bắt đầu Auto Worker - Giám sát $QUEUE_DIR"
echo "📦 Backup folder: $BACKUP_DIR"

process_task() {
    local task_file="$1"
    local task_name=$(basename "$task_file")
    local prompt=$(cat "$task_file")
    echo "▶️ Đang xử lý: $task_name"

    # Backup task file ngay khi nhận
    cp "$task_file" "$BACKUP_DIR/$task_name"

    local result=""
    local success=false

    # 1. Ưu tiên cao nhất: Claude Opus 4.7 cho các task planning/complex
    # Nếu file task có chữ "plan" hoặc "complex", ưu tiên Opus 4.7
    if echo "$task_name" | grep -Eiq "(plan|complex|spec)"; then
        echo "  [1/5] Thử Genspark (Claude Opus 4.7 - Premium Model)..."
        result=$(genspark chat ask "$prompt" --model claude-opus-4-7 2>&1)
        if ! echo "$result" | grep -Eiq "(Credit exhausted|429|No session cookies|Error)"; then
            success=true
        fi
    fi

    # 2. Nếu Opus 4.7 thất bại, hoặc task thường, thử Opus 4.6
    if [ "$success" = false ]; then
        echo "  [2/5] Thử Genspark (Claude Opus 4.6)..."
        result=$(genspark chat ask "$prompt" --model claude-opus-4-6 2>&1)
        if ! echo "$result" | grep -Eiq "(Credit exhausted|429|No session cookies|Error)"; then
            success=true
        fi
    fi

    # 3. GPT-5.4 Fallback trên Genspark
    if [ "$success" = false ]; then
        echo "  [3/5] Thử Genspark (GPT-5.4)..."
        result=$(genspark chat ask "$prompt" --model gpt-5.4 2>&1)
        if ! echo "$result" | grep -Eiq "(Credit exhausted|429|No session cookies|Error)"; then
            success=true
        fi
    fi

    # 4. Gemini CLI Fallback
    if [ "$success" = false ]; then
        echo "  [4/5] Thử Gemini CLI (Google Native)..."
        result=$(gemini ask "$prompt" 2>&1)
        if [ $? -eq 0 ]; then
            success=true
        fi
    fi

    # 5. OpenCode CLI Fallback cuối cùng
    if [ "$success" = false ]; then
        echo "  [5/5] Thử OpenCode CLI (Local/Fallback)..."
        result=$(opencode exec "$prompt" 2>&1)
        if [ $? -eq 0 ]; then
            success=true
        fi
    fi

    # Xử lý thất bại 100%
    if [ "$success" = false ]; then
        echo "  ❌ CẢ 5 LUỒNG ĐỀU THẤT BẠI CHO TASK: $task_name!"
        mv "$task_file" "$FAILED_DIR/"
        
        # Báo cho Supervisor Agent biết
        curl -s -X POST http://localhost:8080/hook/task_failed \
             -d "{\"task\":\"$task_name\"}" \
             -H "Content-Type: application/json" > /dev/null
             
        return 1
    fi

    # Xử lý thành công
    echo "  ✅ Hoàn thành thành công!"
    echo "$result" > "${task_file}.out"
    mv "$task_file" "$PROCESSED_DIR/"
    cp "${task_file}.out" "$BACKUP_DIR/${task_name}.out" # Backup kết quả
    
    # Báo cho Supervisor Agent biết để gọi luồng kế tiếp
    curl -s -X POST http://localhost:8080/hook/task_done \
         -d "{\"task\":\"$task_name\"}" \
         -H "Content-Type: application/json" > /dev/null
    return 0
}

# Vòng lặp chính (Long-polling)
while true; do
    for task in "$QUEUE_DIR"/*.task; do
        if [ -f "$task" ]; then
            process_task "$task"
        fi
    done
    sleep 2
done
