"""
Feature Extractor for Phishing Website Detection (Backend Module).
Mirrors ml/src/feature_extractor.py to guarantee strict feature alignment.
"""

import re
from urllib.parse import urlparse
from typing import Dict, Any, List

FEATURE_NAMES = [
    "url_length",
    "hostname_length",
    "path_length",
    "num_dots",
    "num_hyphens",
    "num_underscores",
    "num_slashes",
    "num_question_marks",
    "num_equals",
    "num_at",
    "num_ampersands",
    "num_special_chars",
    "num_digits",
    "num_subdomains",
    "has_https",
    "has_ip",
    "has_suspicious_keywords",
    "is_shortened",
    "hostname_hyphen_count",
    "path_depth",
    "has_port",
    "ratio_digits_url",
]

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "update", "banking", "secure", "account",
    "signin", "confirm", "paypal", "apple", "support", "wallet",
    "password", "credential", "auth", "recover", "security",
    "webscr", "ebayisapi", "billing", "authenticate", "suspend",
    "validation", "service", "safety", "re-activate"
]

SHORTENER_DOMAINS = {
    "bit.ly", "tinyurl.com", "goo.gl", "t.co", "is.gd", "cli.gs",
    "yfrog.com", "migre.me", "ff.im", "tiny.cc", "url4.eu", "twit.ac",
    "su.pr", "twurl.nl", "snipurl.com", "short.to", "budurl.com",
    "ping.fm", "post.ly", "just.as", "bkite.com", "snipr.com",
    "fic.kr", "loopt.us", "doiop.com", "short.ie", "kl.am", "wp.me",
    "rubyurl.com", "om.ly", "to.ly", "bit.do", "t.ly", "lnkd.in",
    "db.tt", "qr.ae", "adf.ly", "cur.lv", "ity.im", "q.gs", "po.st",
    "bc.vc", "twitthis.com", "u.to", "j.mp", "buzurl.com", "cutt.ly"
}

IPV4_PATTERN = re.compile(
    r"^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$"
)


def extract_features(raw_url: str) -> Dict[str, Any]:
    """
    Extracts all 22 engineered features from a URL string.
    Returns a dictionary of feature names mapped to their numeric values.
    """
    if not raw_url:
        url = ""
    else:
        url = raw_url.strip()

    # Prepend scheme if missing for accurate urlparse parsing
    parsed_candidate = url
    if not (url.startswith("http://") or url.startswith("https://") or url.startswith("ftp://")):
        parsed_candidate = "http://" + url

    try:
        parsed = urlparse(parsed_candidate)
        hostname = (parsed.hostname or "").lower()
        path = parsed.path or ""
        netloc = parsed.netloc or ""
    except Exception:
        hostname = ""
        path = ""
        netloc = ""

    url_length = len(url)
    hostname_length = len(hostname)
    path_length = len(path)

    num_dots = url.count(".")
    num_hyphens = url.count("-")
    num_underscores = url.count("_")
    num_slashes = url.count("/")
    num_question_marks = url.count("?")
    num_equals = url.count("=")
    num_at = url.count("@")
    num_ampersands = url.count("&")

    # Count other unusual symbols (e.g. %, !, ~, ;, $)
    standard_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:/.?=&@-_")
    num_special_chars = sum(1 for c in url if c not in standard_chars)

    num_digits = sum(1 for c in url if c.isdigit())

    # Subdomain calculation
    subdomains = 0
    if hostname:
        clean_host = hostname
        if clean_host.startswith("www."):
            clean_host = clean_host[4:]
        parts = clean_host.split(".")
        if len(parts) > 2:
            subdomains = len(parts) - 2

    # HTTPS check
    has_https = 1 if url.lower().startswith("https://") else 0

    # IP address check
    clean_host_no_port = hostname.split(":")[0] if ":" in hostname else hostname
    has_ip = 1 if IPV4_PATTERN.match(clean_host_no_port) else 0

    # Suspicious keywords
    url_lower = url.lower()
    has_suspicious_keywords = 1 if any(kw in url_lower for kw in SUSPICIOUS_KEYWORDS) else 0

    # URL Shortener check
    is_shortened = 1 if any(shortener in hostname for shortener in SHORTENER_DOMAINS) else 0

    # Hostname hyphens
    hostname_hyphen_count = hostname.count("-")

    # Path depth
    path_depth = path.count("/")

    # Non-standard port
    has_port = 1 if (":" in netloc and not netloc.endswith(":80") and not netloc.endswith(":443")) else 0

    # Ratio of digits to total URL length
    ratio_digits_url = round(float(num_digits) / max(url_length, 1), 4)

    return {
        "url_length": int(url_length),
        "hostname_length": int(hostname_length),
        "path_length": int(path_length),
        "num_dots": int(num_dots),
        "num_hyphens": int(num_hyphens),
        "num_underscores": int(num_underscores),
        "num_slashes": int(num_slashes),
        "num_question_marks": int(num_question_marks),
        "num_equals": int(num_equals),
        "num_at": int(num_at),
        "num_ampersands": int(num_ampersands),
        "num_special_chars": int(num_special_chars),
        "num_digits": int(num_digits),
        "num_subdomains": int(subdomains),
        "has_https": int(has_https),
        "has_ip": int(has_ip),
        "has_suspicious_keywords": int(has_suspicious_keywords),
        "is_shortened": int(is_shortened),
        "hostname_hyphen_count": int(hostname_hyphen_count),
        "path_depth": int(path_depth),
        "has_port": int(has_port),
        "ratio_digits_url": float(ratio_digits_url),
    }


def features_to_vector(features: Dict[str, Any]) -> List[float]:
    """
    Transforms the feature dictionary into an ordered list corresponding to FEATURE_NAMES.
    Guarantees strict identical column order for machine learning models.
    """
    return [float(features[name]) for name in FEATURE_NAMES]
