# CS50P Week 5 — Unit Tests (pytest)

A beginner-friendly walkthrough of **exactly** what CS50P Week 5 teaches — nothing more, nothing less. If you've never tested code before, this is written for you.

---

## Table of Contents

1. [Why bother testing at all?](#1-why-bother-testing-at-all)
2. [The old way: `print` statements](#2-the-old-way-print-statements)
3. [Writing a separate test function](#3-writing-a-separate-test-function)
4. [`assert` — telling Python "this must be true"](#4-assert--telling-python-this-must-be-true)
5. [The problem with `assert` alone](#5-the-problem-with-assert-alone)
6. [Meet `pytest`](#6-meet-pytest)
7. [Splitting one test into many small tests](#7-splitting-one-test-into-many-small-tests)
8. [Testing for errors with `pytest.raises`](#8-testing-for-errors-with-pytestraises)
9. [Important: your function must `return`, not `print`](#9-important-your-function-must-return-not-print)
10. [Running a whole folder of tests](#10-running-a-whole-folder-of-tests)
11. [Recap](#11-recap)

---

## 1. Why bother testing at all?

So far, you've probably tested your code by running it and typing in numbers to see if the output "looks right." That's slow, and you'll forget to check weird cases (negative numbers, zero, wrong types).

**The idea of this week:** write code that checks your code for you, automatically, every time.

---

## 2. The old way: `print` statements

Say you have this file, `calculator.py`:

```python
def main():
    x = int(input("What's x? "))
    print("x squared is", square(x))


def square(n):
    return n * n


if __name__ == "__main__":
    main()
```

To test `square`, you'd normally just run the program and type in `2`, see if it says `4`, then run it again for `3`, and so on. That works, but it doesn't scale, and it's easy to skip a case.

---

## 3. Writing a separate test function

CS50P's convention: create a **new file** named `test_calculator.py` (the `test_` prefix matters — more on that later). Inside it, import the function you want to test and write a function that checks it:

```python
from calculator import square


def main():
    test_square()


def test_square():
    if square(2) != 4:
        print("2 squared was not 4")
    if square(3) != 9:
        print("3 squared was not 9")


if __name__ == "__main__":
    main()
```

Run it with `python test_calculator.py`. If nothing prints, either your code is correct — or your test just didn't happen to catch a bug. This `if ... print(...)` pattern is clunky, though.

---

## 4. `assert` — telling Python "this must be true"

Python has a built-in keyword, `assert`, that lets you state a fact you expect to be true. If it's **not** true, Python raises an `AssertionError` and stops.

```python
from calculator import square


def main():
    test_square()


def test_square():
    assert square(2) == 4
    assert square(3) == 9


if __name__ == "__main__":
    main()
```

This does the same job as the `if` version above, but in far fewer lines. If `square(2)` doesn't equal `4`, Python will crash right there with an `AssertionError`, telling you something is wrong.

---

## 5. The problem with `assert` alone

If you want a friendlier message instead of a raw crash, you could wrap each `assert` in a `try/except`:

```python
def test_square():
    try:
        assert square(2) == 4
    except AssertionError:
        print("2 squared is not 4")
    try:
        assert square(3) == 9
    except AssertionError:
        print("3 squared is not 9")
    try:
        assert square(-2) == 4
    except AssertionError:
        print("-2 squared is not 4")
```

It works, but look how much code you now need just to test a handful of cases. **This is the exact problem `pytest` was built to solve.**

---

## 6. Meet `pytest`

`pytest` is a separate tool (not built into Python) that runs your `assert` statements for you and gives you a clean report of what passed and what failed.

**Install it:**

```bash
pip install pytest
```

Now simplify your test file back down to plain `assert` lines — no `try/except`, no `if`, no `main()` needed:

```python
from calculator import square


def test_square():
    assert square(2) == 4
    assert square(3) == 9
    assert square(-2) == 4
    assert square(-3) == 9
    assert square(0) == 0
```

Run it from the terminal — not with `python`, but with:

```bash
pytest test_calculator.py
```

- If everything passes, you'll see a green dot / "passed" message.
- If something fails, you'll see a red `F`, plus an `E` line explaining exactly which `assert` failed and what value it got instead.

> **Naming rule:** `pytest` only looks inside files that start with `test_` and functions that start with `test_`. Name things wrong, and `pytest` will find nothing to run — with no error to warn you.

---

## 7. Splitting one test into many small tests

Here's a subtle catch: `pytest` **stops checking a function's remaining `assert` lines the moment one of them fails.** So if `test_square` has 5 `assert` lines and the 2nd one fails, you won't find out whether lines 3, 4, and 5 also would have failed.

**Fix:** split your one big test function into several smaller ones. `pytest` runs *every* test function it finds, even if one of them fails:

```python
from calculator import square


def test_positive():
    assert square(2) == 4
    assert square(3) == 9


def test_negative():
    assert square(-2) == 4
    assert square(-3) == 9


def test_zero():
    assert square(0) == 0
```

Now if `test_positive` fails, `test_negative` and `test_zero` still run — giving you the full picture of what's broken, not just the first thing.

---

## 8. Testing for errors with `pytest.raises`

Some functions are *supposed* to raise an error when given bad input. You need to test that too. `pytest` gives you `pytest.raises` for exactly this:

```python
import pytest

from calculator import square


def test_positive():
    assert square(2) == 4
    assert square(3) == 9


def test_negative():
    assert square(-2) == 4
    assert square(-3) == 9


def test_zero():
    assert square(0) == 0


def test_str():
    with pytest.raises(TypeError):
        square("cat")
```

Read `with pytest.raises(TypeError):` as: *"I expect the line(s) inside this block to raise a `TypeError`. If they don't, fail this test."* This confirms your code fails **safely and predictably**, instead of crashing in some unexpected way.

---

## 9. Important: your function must `return`, not `print`

This trips people up. Say you have `hello.py`:

```python
def hello(to="world"):
    print("hello,", to)
```

You **cannot** test this properly:

```python
from hello import hello

def test_hello():
    assert hello("David") == "hello, David"   # ❌ this will fail
```

Why? Because `hello()` prints to the screen and returns `None`. There's nothing for `assert` to compare. The fix is to make the function **return** a value instead of printing it:

```python
def hello(to="world"):
    return f"hello, {to}"
```

Now testing works correctly:

```python
from hello import hello


def test_default():
    assert hello() == "hello, world"


def test_argument():
    assert hello("David") == "hello, David"
```

**Takeaway:** if you want to unit test a function, that function needs to `return` its result — not just `print` it.

---

## 10. Running a whole folder of tests

Once you have several test files, you can run them all at once by putting them in a folder.

1. Create a folder: `mkdir test`
2. Create a test file inside it: `code test/test_hello.py`
3. Add an **empty** special file so `pytest` recognizes the folder as testable: `code test/__init__.py`

Your structure now looks like:

```
project/
├── hello.py
└── test/
    ├── __init__.py
    └── test_hello.py
```

Now run everything in that folder with one command:

```bash
pytest test
```

Without the `__init__.py` file, `pytest` won't treat the folder as a proper test package.

---

## 11. Recap

That's the entire scope of CS50P Week 5:

| Concept | What it does |
|---|---|
| `assert` | States a fact that must be true, or raises `AssertionError` |
| `pytest` | Third-party tool that runs your `assert` statements and reports pass/fail clearly |
| Splitting tests into separate `test_` functions | Ensures one failure doesn't hide other failures |
| `pytest.raises(SomeError)` | Confirms your code raises the *correct* error on bad input |
| `return` vs `print` | Functions must `return` a value to be testable with `assert` |
| `test/` folder + `__init__.py` | Lets you run every test file at once with `pytest test` |

Nothing here uses fixtures, mocking, or `parametrize` — those are **not** part of CS50P Week 5, and you don't need them yet.

---

## License

Free to use, copy, and adapt for your own CS50P study notes or public repo.