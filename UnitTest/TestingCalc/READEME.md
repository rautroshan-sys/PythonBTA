# CS50P Week 5 — Unit Testing with `pytest`

A practical, no-fluff reference for the core `pytest` concepts covered in CS50P Week 5. Written for anyone learning Python testing for the first time, using CS50P-style examples.

---

## Table of Contents

- [Why Testing?](#why-testing)
- [pytest vs assert-only scripts](#pytest-vs-assert-only-scripts)
- [Installation](#installation)
- [Test Discovery — Naming Rules](#test-discovery--naming-rules)
- [Writing Your First Test](#writing-your-first-test)
- [Testing for Exceptions](#testing-for-exceptions)
- [Multiple Test Functions per Behavior](#multiple-test-functions-per-behavior)
- [Project Structure](#project-structure)
- [Running Tests](#running-tests)
- [Common Pitfalls](#common-pitfalls)
- [Quick Reference](#quick-reference)

---

## Why Testing?

Manually running a script and eyeballing the output doesn't scale. As functions grow, you need a fast, repeatable way to confirm:

- Correct inputs produce correct outputs
- Edge cases (empty strings, negative numbers, `None`) are handled
- Invalid inputs raise the right errors instead of crashing silently

`pytest` automates this. Write the expected behavior once, run it forever.

---

## pytest vs assert-only scripts

You *can* test with plain `assert` statements in a `if __name__ == "__main__":` block, but `pytest`:

- Automatically finds and runs every test function across your project
- Reports **which specific test failed** and why (not just "AssertionError" with no context)
- Doesn't stop at the first failure — it runs everything and gives you a full report
- Is the industry-standard tool, not a CS50-only convention

---

## Installation

```bash
pip install pytest
```

Verify it installed correctly:

```bash
pytest --version
```

---

## Test Discovery — Naming Rules

`pytest` finds tests automatically, but **only if you follow its naming conventions**:

| Item | Rule |
|---|---|
| Test file | Must start with `test_` (e.g. `test_project.py`) |
| Test function | Must start with `test_` (e.g. `def test_add():`) |
| Test class (optional) | Must start with `Test` |

> If your file or function name doesn't match this pattern, `pytest` will silently skip it. This is the #1 reason "my tests aren't running."

**Convention:** if your project file is `project.py`, your test file is `test_project.py`, in the same directory.

---

## Writing Your First Test

Suppose you have this function in `working_with_password.py`:

```python
def hash_password(password):
    return password[::-1] + "!"
```

Your test file, `test_working_with_password.py`:

```python
from working_with_password import hash_password


def test_hash_password():
    assert hash_password("hello") == "olleh!"
    assert hash_password("") == "!"
    assert hash_password("cat") == "tac!"
```

Each `assert` checks one expected input → output pair. If any `assert` fails, `pytest` reports **that exact line** — not just "something broke."

---

## Testing for Exceptions

CS50P Week 5 emphasizes this pattern heavily: confirming a function raises the correct error for bad input.

```python
import pytest
from working_with_password import hash_password


def test_hash_password_type_error():
    with pytest.raises(TypeError):
        hash_password(123)
    with pytest.raises(TypeError):
        hash_password(None)
```

**How it works:**
- `pytest.raises(ExceptionType)` is a context manager.
- The code inside the `with` block is expected to raise `ExceptionType`.
- If it does → the test passes.
- If it doesn't (or raises a *different* exception) → the test fails.

This is different from a regular `assert` because you're not checking a return value — you're checking *behavior under failure*.

---

## Multiple Test Functions per Behavior

Don't cram everything into one giant `test_` function. Split by behavior — it makes failures easier to diagnose:

```python
def test_valid_password():
    assert hash_password("abc") == "cba!"

def test_empty_password():
    assert hash_password("") == "!"

def test_invalid_type():
    with pytest.raises(TypeError):
        hash_password(42)
```

If `test_invalid_type` fails, you instantly know the *type-checking* logic is broken — not the reversal logic.

---

## Project Structure

A typical CS50P Week 5 project looks like this:

```
project/
├── project.py          # main program with 3+ functions
├── test_project.py      # tests for each function
└── requirements.txt      # optional, lists dependencies (e.g. pytest)
```

CS50P's `project.py` requirement: at least 3 custom functions besides `main()`, each with a corresponding test function in `test_project.py`.

---

## Running Tests

```bash
# Run all tests in the current directory
pytest

# Run a specific file
pytest test_project.py

# Verbose output (shows each test name + pass/fail)
pytest -v

# Stop at the first failure
pytest -x

# Show print() output even on passing tests
pytest -s
```

**Reading the output:**
- `.` = one passing test
- `F` = one failing test
- A summary at the bottom shows exactly which assertion failed and the expected vs. actual value

---

## Common Pitfalls

- **Forgetting the `test_` prefix** on the file or function — `pytest` finds nothing, reports "no tests ran," and gives no error to explain why.
- **Importing the wrong thing** — if `project.py` defines `def add(a, b):`, your test file needs `from project import add`, not `import project` followed by calling `add()` directly.
- **Testing only the happy path** — CS50P graders (and real-world reviewers) specifically check for edge cases: empty input, wrong type, negative numbers, boundary values.
- **One giant assert-fest in a single function** — makes it harder to tell *which* case broke when the test fails.
- **Not testing exceptions at all** — if your function is supposed to raise `ValueError` on bad input, that needs its own explicit test with `pytest.raises`.

---

## Quick Reference

| Task | Syntax |
|---|---|
| Basic assertion | `assert func(x) == expected` |
| Test file name | `test_<filename>.py` |
| Test function name | `def test_<name>():` |
| Check for exception | `with pytest.raises(ExceptionType):` |
| Install pytest | `pip install pytest` |
| Run all tests | `pytest` |
| Verbose run | `pytest -v` |

---

## License

Free to use, copy, and adapt for your own CS50P study notes or public repo.