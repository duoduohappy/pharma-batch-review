# Source: kemval/labvault/views/test_results.py, MIT, Copyright (c) 2026 Kembly
def determine_status(value, spec_min, spec_max):
    if value is None:
        return "Fail (OOS)"
    if spec_min is not None and value < spec_min:
        return "Fail (OOS)"
    if spec_max is not None and value > spec_max:
        return "Fail (OOS)"
    return "Pass"
