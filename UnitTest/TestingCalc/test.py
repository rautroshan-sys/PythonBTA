from calc import square

def main():
    test_square()

def test_square():
    if square(2) == 4:
        print("Test passed: square(2) == 4")
    if square(-3) == 9:
        print("Test passed: square(-3) == 9")

if __name__ == "__main__":
    main()