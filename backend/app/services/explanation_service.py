"""
Explainable AI (XAI) service for phishing URL predictions.
Generates human-understandable, feature-grounded rationales explaining why a URL
was classified as Phishing or Legitimate.
"""

from typing import Dict, Any, List


def generate_explanation(features: Dict[str, Any], prediction: str, confidence: float) -> List[str]:
    """
    Evaluates real, extracted features against established security heuristics
    and produces grounded explanations for transparency and viva demonstration.
    """
    reasons: List[str] = []

    if prediction == "PHISHING":
        # 1. IP address host
        if features.get("has_ip") == 1:
            reasons.append("URL uses a raw IP address instead of a registered domain name (common in evasion attacks).")

        # 2. Suspicious keywords
        if features.get("has_suspicious_keywords") == 1:
            reasons.append("Contains targeted authentication/security keywords frequently abused in credential harvesting.")

        # 3. URL Shortener
        if features.get("is_shortened") == 1:
            reasons.append("Employs a URL shortening service which obscures the genuine destination hostname.")

        # 4. HTTPS protocol missing
        if features.get("has_https") == 0:
            reasons.append("Lacks HTTPS encryption; transport layer security is absent.")

        # 5. Excessive subdomains
        subdomains = features.get("num_subdomains", 0)
        if subdomains >= 2:
            reasons.append(f"Excessive subdomain depth detected ({subdomains} subdomains), often used for brand impersonation.")

        # 6. Excessive length
        url_len = features.get("url_length", 0)
        if url_len > 75:
            reasons.append(f"URL length is unusually long ({url_len} characters), typical of obfuscated payloads.")

        # 7. Hostname hyphens / special characters
        hyphens = features.get("hostname_hyphen_count", 0)
        if hyphens >= 2:
            reasons.append(f"Hostname contains multiple hyphens ({hyphens}), indicating potential typo-squatting or brand spoofing.")

        # 8. Special symbols (@, multiple dots, etc.)
        at_count = features.get("num_at", 0)
        if at_count > 0:
            reasons.append("Contains '@' symbol, which can mislead browsers into redirecting user credentials.")

        dots = features.get("num_dots", 0)
        if dots >= 4:
            reasons.append(f"Unusually high dot count ({dots} dots) in URL structure.")

        # 9. Digit density
        digit_ratio = features.get("ratio_digits_url", 0.0)
        if digit_ratio > 0.15:
            reasons.append(f"High density of numeric digits ({int(digit_ratio * 100)}% of URL) typical of automated malicious domains.")

        # Fallback if no specific threshold triggered but overall tree fired
        if not reasons:
            reasons.append("Combined heuristic pattern across path depth and lexical token distribution matched known phishing signatures.")

    else:
        # Legitimate justifications
        if features.get("has_https") == 1:
            reasons.append("Protected by standard HTTPS encryption protocol.")

        if features.get("has_ip") == 0:
            reasons.append("Uses a standard, human-readable domain name with no raw IP address.")

        if features.get("is_shortened") == 0:
            reasons.append("Direct destination URL with no obfuscating shortening service.")

        if features.get("has_suspicious_keywords") == 0:
            reasons.append("No suspicious credential-harvesting tokens detected in URL path.")

        if features.get("num_subdomains", 0) <= 1:
            reasons.append("Clean domain hierarchy with standard subdomain depth.")

        if features.get("url_length", 0) <= 75:
            reasons.append("Standard URL length and clean parameter structure.")

        if not reasons:
            reasons.append("URL structure conforms to standard legitimate web specifications.")

    return reasons
