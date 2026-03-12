import os
import json
import datetime
from pathlib import Path

PROJECT_DIR = os.getenv("CLAUDE_PROJECT_DIR", ".")
HOOK_EVENT = os.getenv("CLAUDE_HOOK_EVENT", "unknown")

BASE_DIR = Path(PROJECT_DIR) / ".claude" / "hooks"
LOG_DIR = BASE_DIR / "logs"
STATE_DIR = BASE_DIR / "state"

LOG_DIR.mkdir(parents=True, exist_ok=True)
STATE_DIR.mkdir(parents=True, exist_ok=True)


def log_event(event, data=None):
    """Write hook events to log file."""
    log_file = LOG_DIR / "agent.log"

    entry = {
        "time": datetime.datetime.utcnow().isoformat(),
        "event": event,
        "data": data or {}
    }

    with open(log_file, "a") as f:
        f.write(json.dumps(entry) + "\n")


def load_state():
    """Load session state."""
    state_file = STATE_DIR / "session.json"

    if state_file.exists():
        with open(state_file) as f:
            return json.load(f)

    return {}


def save_state(state):
    """Save session state."""
    state_file = STATE_DIR / "session.json"

    with open(state_file, "w") as f:
        json.dump(state, f, indent=2)


def on_session_start():
    state = {
        "session_start": datetime.datetime.utcnow().isoformat(),
        "tool_calls": 0,
        "files_modified": []
    }

    save_state(state)

    log_event("SessionStart", state)


def on_pre_tool_use():
    state = load_state()

    state["tool_calls"] = state.get("tool_calls", 0) + 1
    save_state(state)

    log_event("PreToolUse", state)


def on_post_tool_use():
    log_event("PostToolUse")


def on_task_completed():
    state = load_state()

    report = {
        "summary": "Task completed",
        "tool_calls": state.get("tool_calls", 0),
        "session_start": state.get("session_start")
    }

    report_file = LOG_DIR / "task_report.json"

    with open(report_file, "w") as f:
        json.dump(report, f, indent=2)

    log_event("TaskCompleted", report)


def on_session_end():
    state = load_state()

    duration = "unknown"
    if "session_start" in state:
        start = datetime.datetime.fromisoformat(state["session_start"])
        duration = str(datetime.datetime.utcnow() - start)

    log_event("SessionEnd", {"duration": duration})


def main():
    handlers = {
        "SessionStart": on_session_start,
        "PreToolUse": on_pre_tool_use,
        "PostToolUse": on_post_tool_use,
        "TaskCompleted": on_task_completed,
        "SessionEnd": on_session_end
    }

    handler = handlers.get(HOOK_EVENT)

    if handler:
        handler()
    else:
        log_event("UnknownEvent", {"event": HOOK_EVENT})


if __name__ == "__main__":
    main()