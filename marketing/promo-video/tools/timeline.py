"""
Scene timing shared by the animatic (temp voice) and the final cut (real voice).

A voice line belongs to the scene where it starts and may span the next scenes
(`span` in storyboard.json). Its scenes share the line's length plus a short pause;
a few scenes hold longer so the moment can land.
"""

FADE = 0.3          # cross-fade the timeline is measured with; motion.js uses its own 0.4 inside the same slots
VOICE_LEAD = 0.1    # voice starts this long after the cross-fade ends
PAUSE = 0.3         # breath after each line
HOLD = {"F02": 0.5, "F07": 0.3, "F08": 0.4, "F09": 0.3, "F13": 1.1, "F14": 0.3, "F24": 1.8}
SILENT_LEN = {"F10": 1.6}
MIN_PER_SCENE = 1.4


def scene_order(sb: dict) -> list:
    return [f for act in sb["acts"] for f in act["frames"]]


def compute_slots(sb: dict, durations: dict) -> list:
    """durations: {frame id where a line starts: seconds of speech}. Returns [{id, start, len, line}]."""
    order = scene_order(sb)
    slots = []
    i = 0
    while i < len(order):
        fid = order[i]
        fr = sb["frames"][fid]
        span = int(fr.get("span", 1)) if fr["vo"].strip() else 1
        group = order[i:i + span]
        if fid in durations:
            total = max(MIN_PER_SCENE * span, durations[fid] + PAUSE + HOLD.get(fid, 0.0))
        else:
            total = sum(SILENT_LEN.get(g, 2.0 + HOLD.get(g, 0.0)) for g in group)
        for k, g in enumerate(group):
            slots.append({"id": g, "len": round(total / len(group), 3), "line": fid if (k == 0 and fid in durations) else None})
        i += span
    t = 0.0
    for s in slots:
        s["start"] = round(t, 3)
        t += s["len"]
    return slots


def voice_at(slot: dict) -> float:
    """When a line starts in the film."""
    return slot["start"] + FADE + VOICE_LEAD
