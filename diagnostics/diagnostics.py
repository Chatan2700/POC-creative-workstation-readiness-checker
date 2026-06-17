"""Generate creative workstation readiness diagnostics.

The script uses only Python standard library modules so it can run on
freshly provisioned endpoints without dependency setup.
"""

from __future__ import annotations

import json
import os
import platform
import shutil
import socket
import subprocess
from datetime import datetime, timezone
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
REPORT_PATH = ROOT_DIR / "data" / "report.json"
REPORTS_DIR = ROOT_DIR / "data" / "reports"

CREATIVE_TOOLS = {
    "Adobe Photoshop": {
        "executables": ["Photoshop", "Photoshop.exe"],
        "paths": [
            r"C:\Program Files\Adobe\Adobe Photoshop*\Photoshop.exe",
            "/Applications/Adobe Photoshop*/Adobe Photoshop*.app",
        ],
    },
    "Adobe Premiere Pro": {
        "executables": ["Adobe Premiere Pro", "Adobe Premiere Pro.exe"],
        "paths": [
            r"C:\Program Files\Adobe\Adobe Premiere Pro*\Adobe Premiere Pro.exe",
            "/Applications/Adobe Premiere Pro*/Adobe Premiere Pro*.app",
        ],
    },
    "Adobe After Effects": {
        "executables": ["AfterFX", "AfterFX.exe"],
        "paths": [
            r"C:\Program Files\Adobe\Adobe After Effects*\Support Files\AfterFX.exe",
            "/Applications/Adobe After Effects*/Adobe After Effects*.app",
        ],
    },
    "Figma": {
        "executables": ["Figma", "Figma.exe"],
        "paths": [
            r"C:\Users\*\AppData\Local\Figma\Figma.exe",
            "/Applications/Figma.app",
        ],
    },
    "Blender": {
        "executables": ["blender", "blender.exe"],
        "paths": [
            r"C:\Program Files\Blender Foundation\Blender*\blender.exe",
            "/Applications/Blender.app",
        ],
    },
    "Cinema 4D": {
        "executables": ["Cinema 4D", "Cinema 4D.exe", "c4d"],
        "paths": [
            r"C:\Program Files\Maxon Cinema 4D*\Cinema 4D.exe",
            "/Applications/Maxon Cinema 4D*/Cinema 4D.app",
        ],
    },
}


def round_gb(byte_count: int) -> int:
    return round(byte_count / (1024**3))


def get_hostname() -> str:
    return socket.gethostname() or "Unknown hostname"


def get_os_name() -> str:
    if platform.system() == "Windows":
        edition = platform.win32_edition()
        release = platform.release()
        return f"Windows {release} {edition}".strip()

    mac_version = platform.mac_ver()[0]
    if mac_version:
        return f"macOS {mac_version}"

    return platform.platform() or "Unknown OS"


def get_cpu_name() -> str:
    cpu = platform.processor() or platform.machine()
    if cpu:
        return cpu

    if platform.system() == "Windows":
        try:
            result = subprocess.run(
                ["wmic", "cpu", "get", "name"],
                capture_output=True,
                text=True,
                timeout=3,
                check=False,
            )
            lines = [line.strip() for line in result.stdout.splitlines() if line.strip()]
            if len(lines) > 1:
                return lines[1]
        except Exception:
            pass

    return "Unknown CPU"


def get_total_ram_gb() -> int:
    if platform.system() == "Windows":
        try:
            import ctypes

            class MemoryStatusEx(ctypes.Structure):
                _fields_ = [
                    ("dwLength", ctypes.c_ulong),
                    ("dwMemoryLoad", ctypes.c_ulong),
                    ("ullTotalPhys", ctypes.c_ulonglong),
                    ("ullAvailPhys", ctypes.c_ulonglong),
                    ("ullTotalPageFile", ctypes.c_ulonglong),
                    ("ullAvailPageFile", ctypes.c_ulonglong),
                    ("ullTotalVirtual", ctypes.c_ulonglong),
                    ("ullAvailVirtual", ctypes.c_ulonglong),
                    ("sullAvailExtendedVirtual", ctypes.c_ulonglong),
                ]

            memory_status = MemoryStatusEx()
            memory_status.dwLength = ctypes.sizeof(MemoryStatusEx)
            if ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(memory_status)):
                return round_gb(memory_status.ullTotalPhys)
        except Exception:
            pass

    try:
        pages = os.sysconf("SC_PHYS_PAGES")
        page_size = os.sysconf("SC_PAGE_SIZE")
        return round_gb(pages * page_size)
    except (AttributeError, ValueError, OSError):
        pass

    if platform.system() == "Windows":
        try:
            result = subprocess.run(
                ["powershell", "-NoProfile", "-Command", "(Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory"],
                capture_output=True,
                text=True,
                timeout=5,
                check=False,
            )
            return round_gb(int(result.stdout.strip()))
        except Exception:
            pass

    return 0


def get_disk_stats() -> tuple[int, int]:
    usage = shutil.disk_usage(ROOT_DIR.anchor or "/")
    return round_gb(usage.total), round_gb(usage.free)


def get_network_status() -> str:
    try:
        with socket.create_connection(("1.1.1.1", 53), timeout=3):
            return "Connected"
    except OSError:
        return "Disconnected"


def path_exists(pattern: str) -> bool:
    return any(Path(match).exists() for match in Path().glob(pattern)) if "*" in pattern and not pattern.startswith("/") else Path(pattern).exists()


def glob_exists(pattern: str) -> bool:
    try:
        return bool(list(Path().glob(pattern)))
    except NotImplementedError:
        return False


def detect_tool(tool_config: dict[str, list[str]]) -> bool:
    for executable in tool_config["executables"]:
        if shutil.which(executable):
            return True

    for candidate in tool_config["paths"]:
        if "*" in candidate:
            try:
                import glob

                if glob.glob(candidate):
                    return True
            except Exception:
                continue
        elif Path(candidate).exists():
            return True

    return False


def detect_creative_tools() -> tuple[list[str], list[str]]:
    installed = []
    missing = []

    for tool_name, tool_config in CREATIVE_TOOLS.items():
        if detect_tool(tool_config):
            installed.append(tool_name)
        else:
            missing.append(tool_name)

    return installed, missing


def calculate_score(
    ram_gb: int,
    disk_total_gb: int,
    disk_free_gb: int,
    network_status: str,
    installed_tools: list[str],
) -> int:
    score = 20

    if ram_gb >= 64:
        score += 25
    elif ram_gb >= 32:
        score += 22
    elif ram_gb >= 16:
        score += 14
    elif ram_gb >= 8:
        score += 8

    free_ratio = disk_free_gb / disk_total_gb if disk_total_gb else 0
    if free_ratio >= 0.25:
        score += 20
    elif free_ratio >= 0.2:
        score += 16
    elif free_ratio >= 0.1:
        score += 8

    if network_status == "Connected":
        score += 15

    tool_ratio = len(installed_tools) / len(CREATIVE_TOOLS)
    score += round(tool_ratio * 40)

    return max(0, min(score, 100))


def status_from_score(score: int) -> str:
    if score >= 90:
        return "Ready"
    if score >= 75:
        return "Ready with minor recommendations"
    if score >= 55:
        return "Needs attention"
    return "Not ready"


def build_recommendations(
    ram_gb: int,
    disk_total_gb: int,
    disk_free_gb: int,
    network_status: str,
    missing_tools: list[str],
) -> list[str]:
    recommendations = []

    tool_guidance = {
        "Adobe Photoshop": "Install Adobe Photoshop for raster image and compositing workflows.",
        "Adobe Premiere Pro": "Install Adobe Premiere Pro for video editing workflows.",
        "Adobe After Effects": "Install Adobe After Effects for motion graphics workflows.",
        "Figma": "Install Figma for product design and collaborative review workflows.",
        "Blender": "Install Blender for 3D modeling and rendering workflows.",
        "Cinema 4D": "Install Cinema 4D for advanced motion design and 3D workflows.",
    }

    for tool in missing_tools[:3]:
        recommendations.append(tool_guidance[tool])

    if ram_gb and ram_gb < 32:
        recommendations.append("Upgrade memory to at least 32 GB for Adobe, 3D, and video workflows.")

    free_ratio = disk_free_gb / disk_total_gb if disk_total_gb else 0
    if free_ratio < 0.2:
        recommendations.append("Maintain at least 20% free disk space for media-heavy projects.")

    if network_status != "Connected":
        recommendations.append("Restore internet connectivity before software activation or cloud collaboration.")

    recommendations.append("Confirm Adobe Creative Cloud license assignment before deployment.")

    return recommendations


def generate_report() -> dict[str, object]:
    disk_total_gb, disk_free_gb = get_disk_stats()
    installed_tools, missing_tools = detect_creative_tools()
    ram_gb = get_total_ram_gb()
    network_status = get_network_status()
    readiness_score = calculate_score(
        ram_gb,
        disk_total_gb,
        disk_free_gb,
        network_status,
        installed_tools,
    )

    hostname = get_hostname()
    last_checked = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    report_id = f"{safe_filename(hostname)}-{last_checked.replace(':', '').replace('-', '').replace('T', '-').replace('Z', 'z')}"

    return {
        "id": report_id,
        "hostname": hostname,
        "os": get_os_name(),
        "cpu": get_cpu_name(),
        "ramGb": ram_gb,
        "diskTotalGb": disk_total_gb,
        "diskFreeGb": disk_free_gb,
        "networkStatus": network_status,
        "installedTools": installed_tools,
        "missingTools": missing_tools,
        "readinessScore": readiness_score,
        "status": status_from_score(readiness_score),
        "recommendations": build_recommendations(
            ram_gb,
            disk_total_gb,
            disk_free_gb,
            network_status,
            missing_tools,
        ),
        "lastChecked": last_checked,
    }


def safe_filename(value: str) -> str:
    cleaned = "".join(character.lower() if character.isalnum() else "-" for character in value)
    return "-".join(part for part in cleaned.split("-") if part) or "unknown-workstation"


def main() -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    report = generate_report()
    report_json = json.dumps(report, indent=2)
    unique_report_path = REPORTS_DIR / f"{report['id']}.json"
    unique_report_path.write_text(report_json, encoding="utf-8")
    REPORT_PATH.write_text(report_json, encoding="utf-8")
    print(f"Wrote unique diagnostics report to {unique_report_path}")
    print(f"Wrote diagnostics report to {REPORT_PATH}")


if __name__ == "__main__":
    main()
