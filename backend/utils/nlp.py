def categorize(msg):
    msg = msg.lower()
    if "injured" in msg or "hurt" in msg:
        return "medical"
    elif "trapped" in msg or "stuck" in msg:
        return "rescue"
    elif "food" in msg or "water" in msg:
        return "supply"
    else:
        return "general"
