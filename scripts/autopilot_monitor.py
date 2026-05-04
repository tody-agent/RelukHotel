import os
import time
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.live import Live
from rich.text import Text
from rich import box

PROJECT_ROOT = "/Volumes/Data/Hotel/CapyInn"
QUEUE_DIR = os.path.join(PROJECT_ROOT, "queue")
PROCESSED_DIR = os.path.join(QUEUE_DIR, "processed")
FAILED_DIR = os.path.join(QUEUE_DIR, "failed")
LOG_FILE = os.path.join(QUEUE_DIR, "supervisor.log")

console = Console()

def count_files(directory, extension=None):
    if not os.path.exists(directory):
        return 0
    if extension:
        return len([f for f in os.listdir(directory) if f.endswith(extension)])
    return len(os.listdir(directory))

def get_recent_logs(lines_count=15):
    if not os.path.exists(LOG_FILE):
        return ["Chưa có dữ liệu log."]
    with open(LOG_FILE, 'r') as f:
        lines = f.readlines()
    return [l.strip() for l in lines[-lines_count:]]

def generate_layout():
    layout = Layout()
    layout.split_column(
        Layout(name="header", size=3),
        Layout(name="main"),
        Layout(name="footer", size=3)
    )
    
    layout["main"].split_row(
        Layout(name="stats", ratio=1),
        Layout(name="logs", ratio=2)
    )
    return layout

def get_dashboard_content():
    # Thống kê Task
    pending = count_files(QUEUE_DIR, ".task")
    completed = count_files(PROCESSED_DIR, ".out")
    failed = count_files(FAILED_DIR, ".task")
    total = pending + completed + failed
    
    # Bảng thống kê
    stats_table = Table(box=box.ROUNDED, expand=True)
    stats_table.add_column("Trạng thái", justify="left", style="cyan", no_wrap=True)
    stats_table.add_column("Số lượng", justify="right", style="magenta")
    
    stats_table.add_row("⏳ Đang chờ (Pending)", str(pending))
    stats_table.add_row("✅ Hoàn thành (Processed)", f"[green]{completed}[/green]")
    stats_table.add_row("❌ Thất bại (Failed)", f"[red]{failed}[/red]")
    stats_table.add_row("📊 Tổng số (Total)", str(total))
    
    stats_panel = Panel(
        stats_table, 
        title="[b]Tiến độ Dự án[/b]", 
        border_style="blue"
    )
    
    # Log Panel
    logs = get_recent_logs(20)
    log_text = Text()
    for log in logs:
        if "FAILED" in log or "ALERT" in log or "❌" in log:
            log_text.append(log + "\n", style="bold red")
        elif "SUCCESS" in log or "✅" in log:
            log_text.append(log + "\n", style="bold green")
        elif "NEW_TASK" in log or "▶️" in log:
            log_text.append(log + "\n", style="cyan")
        else:
            log_text.append(log + "\n", style="dim")
            
    logs_panel = Panel(
        log_text, 
        title="[b]Hoạt động gần đây (Quyết định & Lỗi)[/b]", 
        border_style="yellow"
    )
    
    # Header & Footer
    header = Panel(f"[b bright_cyan]CM AUTOPILOT MONITOR[/b bright_cyan] - {time.strftime('%Y-%m-%d %H:%M:%S')}", style="on blue")
    
    alert_msg = "Tất cả hệ thống đang hoạt động bình thường."
    if failed > 0:
        alert_msg = f"⚠️ CẢNH BÁO: Phát hiện {failed} task thất bại. Cần rà soát tại thư mục queue/failed/"
        
    footer = Panel(alert_msg, style="bold red" if failed > 0 else "bold green")
    
    layout = generate_layout()
    layout["header"].update(header)
    layout["stats"].update(stats_panel)
    layout["logs"].update(logs_panel)
    layout["footer"].update(footer)
    
    return layout

def main():
    try:
        with Live(get_dashboard_content(), refresh_per_second=1, screen=True) as live:
            while True:
                time.sleep(1)
                live.update(get_dashboard_content())
    except KeyboardInterrupt:
        console.print("[bold green]Đã thoát Autopilot Monitor.[/bold green]")

if __name__ == "__main__":
    main()
