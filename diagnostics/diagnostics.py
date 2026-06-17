"""Generate a simple creative workstation readiness report."""

import json
import os
import platform
import shutil
import socket
from datetime import datetime, timezone
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT_DIR / "data"
REPORTS_DIR = DATA_DIR / "reports"
LATEST_REPORT_PATH = DATA_DIR / "report.json"

CREATIVE_TOOLS = ["Adobe Photoshop", "Adobe Premiere Pro", "Adobe After Effects", "Figma", "Blender", "Cinema 4D"]


def gb(bytes_value: int) -> int:
    return round(bytes_value / (1024**3))


def slug(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value)
    return "-".join(part for part in cleaned.split("-") if part) or "unknown"


def now_utc() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def get_hostname() -> str:
    return socket.gethostname() or "Unknown hostname"


def get_os() -> str:
    if platform.system() == "Windows":
        return f"Windows {platform.release()} {platform.win32_edition()}".strip()
    if platform.system() == "Darwin":
        return f"macOS {platform.mac_ver()[0]}"
    return platform.platform() or "Unknown OS"


def get_cpu() -> str:
    return platform.processor() or platform.machine() or "Unknown CPU"


def get_ram_gb() -> int:
    # Simple RAM check. Windows may return 0 without adding platform-specific code.
    try:
        return gb(os.sysconf("SC_PHYS_PAGES") * os.sysconf("SC_PAGE_SIZE"))
    except (AttributeError, ValueError, OSError):
        return 0


def get_disk() -> tuple[int, int]:
    usage = shutil.disk_usage(ROOT_DIR.anchor or "/")
    return gb(usage.total), gb(usage.free)


def get_network_status() -> str:
    try:
        with socket.create_connection(("1.1.1.1", 53), timeout=3):
            return "Connected"
    except OSError:
        return "Disconnected"


def get_creative_tools():
    # Demo inventory: real detection should come from MDM/software inventory.
    return [], CREATIVE_TOOLS.copy()

def calculate_score(ram_gb, disk_total_gb, disk_free_gb, network, installed_count):
    score = 20
    score += 22 if ram_gb >= 32 else 14 if ram_gb >= 16 else 8 if ram_gb >= 8 else 0
    disk_ratio = disk_free_gb / disk_total_gb if disk_total_gb else 0
    score += 20 if disk_ratio >= 0.25 else 16 if disk_ratio >= 0.20 else 8 if disk_ratio >= 0.10 else 0
    score += 15 if network == "Connected" else 0
    score += round((installed_count / len(CREATIVE_TOOLS)) * 40)
    return max(0, min(score, 100))


def status_from_score(score: int) -> str:
    if score >= 90: return "Ready"
    if score >= 75: return "Ready with minor recommendations"
    if score >= 55: return "Needs attention"
    return "Not ready"


def recommendations(ram_gb, disk_total_gb, disk_free_gb, network, missing_tools):
    items = []
    if ram_gb and ram_gb < 32:
        items.append("Upgrade memory to at least 32 GB for Adobe, 3D, and video workflows.")
    if disk_total_gb and (disk_free_gb / disk_total_gb) < 0.20:
        items.append("Maintain at least 20% free disk space for media-heavy projects.")
    if network != "Connected":
        items.append("Restore internet connectivity before software activation or cloud collaboration.")

    items += [f"Install {tool} for expected creative team workflows." for tool in missing_tools[:3]]
    items.append("Confirm Adobe Creative Cloud license assignment before deployment.")
    items.append("Creative tool detection is demo inventory and should be expanded with MDM data.")
    return items


def build_report() -> dict[str, object]:
    hostname = get_hostname()
    checked_at = now_utc()
    device_id = slug(hostname)
    stamp = checked_at.replace("-", "").replace(":", "").replace("T", "-").replace("Z", "z")
    report_id = f"{device_id}-{stamp}"
    disk_total_gb, disk_free_gb = get_disk()
    installed_tools, missing_tools = get_creative_tools()
    ram_gb = get_ram_gb()
    network = get_network_status()
    score = calculate_score(ram_gb, disk_total_gb, disk_free_gb, network, len(installed_tools))

    return {
        "id": report_id,
        "deviceId": device_id,
        "hostname": hostname,
        "os": get_os(),
        "cpu": get_cpu(),
        "ramGb": ram_gb,
        "diskTotalGb": disk_total_gb,
        "diskFreeGb": disk_free_gb,
        "networkStatus": network,
        "installedTools": installed_tools,
        "missingTools": missing_tools,
        "readinessScore": score,
        "status": status_from_score(score),
        "recommendations": recommendations(ram_gb, disk_total_gb, disk_free_gb, network, missing_tools),
        "lastChecked": checked_at,
    }


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report = build_report()
    content = json.dumps(report, indent=2)
    unique_path = REPORTS_DIR / f"{report['id']}.json"
    LATEST_REPORT_PATH.write_text(content, encoding="utf-8")
    unique_path.write_text(content, encoding="utf-8")
    print(f"Wrote {LATEST_REPORT_PATH}")
    print(f"Wrote {unique_path}")


if __name__ == "__main__":
    main()
