# CS50P — Week 3: Exceptions

A complete reference for handling errors gracefully in Python. Written to work as both a **quick-lookup cheat sheet** and a **full conceptual guide** — skim the bold/code parts if you already know this, read the prose if you don't.

---

## Table of Contents

1. [What Is an Exception?](#1-what-is-an-exception)
2. [try / except — The Basics](#2-try--except--the-basics)
3. [Catching Specific Exceptions](#3-catching-specific-exceptions)
4. [Common Built-in Exceptions](#4-common-built-in-exceptions)
5. [else and finally](#5-else-and-finally)
6. [Raising Your Own Exceptions](#6-raising-your-own-exceptions)
7. [Custom Exception Classes](#7-custom-exception-classes)
8. [Exception Chaining](#8-exception-chaining)
9. [EAFP vs LBYL](#9-eafp-vs-lbyl)
10. [Common Mistakes](#10-common-mistakes)
11. [Quick Reference Cheat Sheet](#11-quick-reference-cheat-sheet)

---

## 1. What Is an Exception?

An **exception** is an event that disrupts the normal flow of a program — usually because something went wrong (bad input, missing file, division by zero, etc.).

Without handling, an exception **crashes** the program:

```python
x = int(input("Number: "))  # crashes if user types "cat"
```

```
ValueError: invalid literal for int() with base 10: 'cat'
```

Exceptions let you **anticipate** these failures and respond to them instead of letting the program die.

> **Key idea:** An exception is not necessarily a bug — it's Python's way of saying "this specific operation could not complete as requested." Your job is to decide what to do about it.

---

## 2. try / except — The Basics

Wrap risky code in a `try` block. If it fails, control jumps to `except`.

```python
try:
    x = int(input("Number: "))
except ValueError:
    print("That's not a number.")
```

**Flow:**
- Python runs the `try` block line by line.
- If an exception occurs, it **immediately stops** executing the rest of the `try` block.
- Python checks if any `except` matches the exception type — if so, that block runs.
- If no `except` matches, the exception propagates upward (and may crash the program).

### Looping until valid input (a very common CS50P pattern)

```python
while True:
    try:
        x = int(input("Number: "))
        break
    except ValueError:
        print("Invalid input.")
```

---

## 3. Catching Specific Exceptions

**Always catch the most specific exception you expect** — never catch blindly unless you have a good reason.

```python
try:
    x = 1 / int(input("Number: "))
except ValueError:
    print("Not a number.")
except ZeroDivisionError:
    print("Can't divide by zero.")
```

### Catching multiple exceptions in one block

```python
try:
    ...
except (ValueError, ZeroDivisionError):
    print("Something went wrong.")
```

### Accessing the exception object

```python
try:
    x = 1 / int(input("Number: "))
except ValueError as e:
    print(f"Invalid input: {e}")
```

### Why avoid bare `except:`

```python
try:
    risky()
except:          # catches EVERYTHING, including KeyboardInterrupt, SystemExit
    print("Error")
```

This hides real bugs (typos, logic errors) behind a generic message. Prefer `except Exception as e:` at minimum, and ideally name the exact exception(s).

---

## 4. Common Built-in Exceptions

| Exception | Typical Cause |
|---|---|
| `ValueError` | Right type, wrong value (`int("cat")`) |
| `TypeError` | Wrong type for an operation (`"2" + 2`) |
| `ZeroDivisionError` | Division or modulo by zero |
| `KeyError` | Missing dictionary key |
| `IndexError` | List/tuple index out of range |
| `FileNotFoundError` | File doesn't exist (subclass of `OSError`) |
| `AttributeError` | Object has no such attribute/method |
| `NameError` | Using a variable that doesn't exist |
| `ImportError` / `ModuleNotFoundError` | Import fails |
| `StopIteration` | Iterator has no more items |

```python
try:
    d = {"name": "Roshan"}
    print(d["age"])
except KeyError:
    print("Key not found.")
```

---

## 5. else and finally

- **`else`** — runs only if the `try` block succeeds (no exception raised).
- **`finally`** — always runs, whether an exception occurred or not (cleanup code: closing files, releasing resources).

```python
try:
    x = int(input("Number: "))
except ValueError:
    print("Invalid input.")
else:
    print(f"You entered {x}")
finally:
    print("Done processing.")
```

**Why use `else` instead of just putting code after `try`?**
It clarifies intent — code in `else` explicitly means "only run this if nothing failed," separating the success path from the try's risky operations (which keeps the `try` block as small/focused as possible — a best practice).

---

## 6. Raising Your Own Exceptions

Use `raise` to trigger an exception deliberately when your code detects an invalid state.

```python
def withdraw(balance, amount):
    if amount > balance:
        raise ValueError("Insufficient funds")
    return balance - amount
```

Callers then decide how to handle it:

```python
try:
    withdraw(100, 500)
except ValueError as e:
    print(e)
```

### Re-raising

Sometimes you want to log/react to an exception but still let it propagate:

```python
try:
    risky()
except ValueError as e:
    print("Logging error...")
    raise  # re-raises the same exception
```

---

## 7. Custom Exception Classes

For domain-specific errors, define your own exception by subclassing `Exception` (or a more specific built-in).

```python
class InsufficientFundsError(Exception):
    """Raised when a withdrawal exceeds the available balance."""
    pass

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(f"Cannot withdraw {amount}, balance is {balance}")
    return balance - amount
```

```python
try:
    withdraw(100, 500)
except InsufficientFundsError as e:
    print(e)
```

**Why bother?** Custom exceptions make your code self-documenting and let callers catch *your* specific error without accidentally swallowing unrelated `ValueError`s elsewhere in the program.

---

## 8. Exception Chaining

Python automatically shows the original exception when a new one is raised inside an `except` block ("during handling of the above exception, another exception occurred"). You can control this explicitly:

```python
try:
    int("cat")
except ValueError as e:
    raise RuntimeError("Failed to process input") from e
```

Use `from e` to preserve the original cause; use `from None` to suppress it if it's not useful context.

---

## 9. EAFP vs LBYL

Two philosophies for handling risky operations:

- **LBYL** — *Look Before You Leap*: check conditions first.
- **EAFP** — *Easier to Ask Forgiveness than Permission*: just try it, and handle the exception if it fails. This is the **Pythonic** style.

```python
# LBYL
if key in d:
    value = d[key]
else:
    value = None

# EAFP (preferred in Python)
try:
    value = d[key]
except KeyError:
    value = None
```

**Why EAFP is preferred in Python:** it avoids race conditions (state can change between the check and the use) and is often faster when the "happy path" is common, since no upfront check is wasted.

---

## 10. Common Mistakes

- ❌ Using bare `except:` — hides real bugs.
- ❌ Catching exceptions you don't actually expect, just to silence errors.
- ❌ Putting too much code inside `try` — only wrap the line(s) that can actually fail.
- ❌ Using exceptions for normal control flow when a simple `if` would be clearer.
- ❌ Forgetting that `finally` runs even after a `return` inside `try`.
- ❌ Not giving custom exceptions a useful message (`raise MyError()` vs `raise MyError("balance too low")`).

---

## 11. Quick Reference Cheat Sheet

```python
# Basic pattern
try:
    risky_code()
except SpecificError as e:
    handle(e)
else:
    only_if_no_error()
finally:
    always_runs()

# Multiple exception types
except (TypeError, ValueError):

# Raising
raise ValueError("message")

# Custom exception
class MyError(Exception):
    pass

# Re-raise
raise

# Chained raise
raise NewError("...") from original_error
```

| Concept | Keyword |
|---|---|
| Try risky code | `try` |
| Handle specific error | `except ErrorType` |
| Run if no error | `else` |
| Always run (cleanup) | `finally` |
| Trigger an error | `raise` |
| Define custom error | `class X(Exception)` |

---

*Reference for CS50P Week 3 — Exceptions. Pairs well with Week 4 (Libraries) where `try/except` is used constantly for handling malformed API responses and file I/O.*