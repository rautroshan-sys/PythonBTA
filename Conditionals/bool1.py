def main():
    x = int(input("Enter a number: "))
    if is_even(x):
        print(f"{x} is even")
    else:
        print(f"{x} is odd")

def is_even(num):
    return True if num % 2 == 0 else False

if __name__ == "__main__":
    main()