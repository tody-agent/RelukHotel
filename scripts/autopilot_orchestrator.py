#!/usr/bin/env python3
"""
Autopilot Orchestrator v2 — Context-Rich Task Dispatcher
Reads autopilot-tasks.md (self-contained context per task) and dispatches to webhook.
Genspark agents CANNOT read files, so each prompt includes full context.
"""
import os
import json
import re
import time
from urllib import request as urllib_request

PROJECT_ROOT = "/Volumes/Data/Hotel/CapyInn"
AUTOPILOT_FILE = os.path.join(
    PROJECT_ROOT, "openspec/changes/01-pricing-engine-vn/autopilot-tasks.md"
)
CONTEXT_PLAN_FILE = os.path.join(
    PROJECT_ROOT, "openspec/changes/01-pricing-engine-vn/autopilot-context.md"
)
DESIGN_FILE = os.path.join(
    PROJECT_ROOT, "openspec/changes/01-pricing-engine-vn/design.md"
)
PROPOSAL_FILE = os.path.join(
    PROJECT_ROOT, "openspec/changes/01-pricing-engine-vn/proposal.md"
)
WEBHOOK_URL = "http://localhost:8080/hook/add_task"

# ── Batch definitions (dependency-aware) ──────────────────────
BATCHES = [
    {"name": "Batch 1 (Parallel)", "tasks": [1, 3, 12]},
    {"name": "Batch 2 (Parallel)", "tasks": [2, 5, 6]},
    {"name": "Batch 3", "tasks": [4]},
    {"name": "Batch 4", "tasks": [7]},
    {"name": "Batch 5", "tasks": [8, 10]},
    {"name": "Batch 6 (Parallel)", "tasks": [9, 11]},
]


def read_file_safe(path):
    if not os.path.exists(path):
        return ""
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def read_context_blocks():
    """Parse autopilot-context.md into {task_number: context_block}."""
    content = read_file_safe(CONTEXT_PLAN_FILE)
    if not content:
        return {}
    
    blocks = {}
    # Split by "## TASK N:" headers
    parts = re.split(r"(?=^## TASK \d+:)", content, flags=re.MULTILINE)
    for part in parts:
        match = re.match(r"^## TASK (\d+):", part)
        if match:
            task_num = int(match.group(1))
            blocks[task_num] = part.strip()
    return blocks


def get_shared_context():
    """Load design.md + proposal.md as shared reference."""
    parts = []
    for path, label in [
        (os.path.join(PROJECT_ROOT, "AGENTS.md"), "AGENTS.md"),
        (DESIGN_FILE, "design.md"),
        (PROPOSAL_FILE, "proposal.md"),
    ]:
        content = read_file_safe(path)
        if content:
            parts.append(f'<file path="{label}">\n{content}\n</file>')
    return "\n\n".join(parts)


def build_prompt(task_num, context_block, shared_context):
    """Build a self-contained prompt for a single task."""
    # Determine task type for model routing
    is_backend = any(
        kw in context_block.lower()
        for kw in ["rust", "backend", "tauri", "crate", "cargo"]
    )
    is_frontend = any(
        kw in context_block.lower()
        for kw in ["react", "frontend", "tsx", "component", "ui"]
    )
    is_docs = any(
        kw in context_block.lower()
        for kw in ["readme", "changelog", "documentation", "user guide"]
    )

    task_type = "complex" if (is_backend or is_frontend) else "general"
    
    prompt = f"""Bạn là AI Developer Agent chuyên Tauri 2 + React 19 + Rust + SQLite.
Dự án: CapyInn — Phần mềm quản lý khách sạn mini (offline-first, desktop).
Thư mục gốc: /Volumes/Data/Hotel/CapyInn/mhm

═══ NHIỆM VỤ ═══
{context_block}

═══ BỐI CẢNH THIẾT KẾ (Design + Business Logic) ═══
{shared_context}

═══ TECH STACK ═══
- Backend: Rust (Tauri 2 commands via #[tauri::command], sqlx SQLite)
- Frontend: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui + Zustand
- IPC: invoke("command_name", {{ params }}) từ @tauri-apps/api/core
- Test: Vitest (jsdom) cho frontend, cargo test cho Rust
- UI imports: @/components/ui/button, @/components/ui/input, lucide-react icons

═══ YÊU CẦU ═══
1. Trả về CODE hoàn chỉnh (không placeholder, không TODO).
2. Ghi rõ file path cần tạo/sửa.
3. Tuân thủ pattern code hiện có (xem context ở trên).
4. Nếu là Rust: dùng u64 cho tiền VND, không float. Dùng chrono cho datetime.
5. Nếu là React: dùng shadcn/ui components, Tailwind classes, invoke() cho IPC.
"""
    return prompt, task_type


def push_task(task_num, prompt, task_type):
    """Push task to webhook server."""
    payload = json.dumps({
        "prompt": prompt,
        "type": task_type,
        "task_id": f"pricing-engine-task-{task_num}",
    }).encode("utf-8")

    req = urllib_request.Request(
        WEBHOOK_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    try:
        urllib_request.urlopen(req, timeout=10)
        return True
    except Exception as e:
        print(f"  ❌ Webhook error: {e}")
        return False


def main():
    print("=" * 60)
    print("🚀 AUTOPILOT ORCHESTRATOR v2 — Context-Rich Dispatch")
    print("=" * 60)

    # Load context
    context_blocks = read_context_blocks()
    shared_context = get_shared_context()

    if not context_blocks:
        print("⚠️  Không tìm thấy context blocks trong autopilot-context.md")
        print("    Chạy lại planning để tạo file context.")
        return

    print(f"📋 Loaded {len(context_blocks)} task contexts")
    print(f"📄 Shared context: {len(shared_context)} chars")
    print()

    total_dispatched = 0
    total_failed = 0

    for batch in BATCHES:
        print(f"\n{'─' * 40}")
        print(f"📦 {batch['name']}: Tasks {batch['tasks']}")
        print(f"{'─' * 40}")

        for task_num in batch["tasks"]:
            ctx = context_blocks.get(task_num)
            if not ctx:
                print(f"  ⏭️  Task {task_num}: no context found, skipping")
                continue

            prompt, task_type = build_prompt(task_num, ctx, shared_context)
            print(f"  📤 Task {task_num} ({task_type}, {len(prompt)} chars)...", end=" ")

            success = push_task(task_num, prompt, task_type)
            if success:
                print("✅")
                total_dispatched += 1
            else:
                print("FAILED")
                total_failed += 1

            time.sleep(2)  # Rate limit between tasks

        # Pause between batches (sequential batches wait for previous)
        if batch != BATCHES[-1]:
            print(f"\n  ⏸️  Batch done. Waiting 5s before next batch...")
            time.sleep(5)

    print()
    print("=" * 60)
    print(f"🎯 Dispatched: {total_dispatched} | Failed: {total_failed}")
    print("   Monitor: python3 scripts/autopilot_monitor.py")
    print("   Results: /queue/processed/")
    print("=" * 60)


if __name__ == "__main__":
    main()
