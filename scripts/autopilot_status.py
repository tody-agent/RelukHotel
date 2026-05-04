import os
from rich.console import Console
from autopilot_monitor import get_dashboard_content

console = Console()
console.print(get_dashboard_content())
