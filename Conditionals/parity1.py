def main():
    x = int(input("Enter a number: "))

    if is_even(x):
        print(f"{x} is even")
    else:
        print(f"{x} is odd")

def is_even(num):
    return num % 2 == 0

if __name__ == "__main__":
    main()