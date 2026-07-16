def main():
    n = int(input("Enter the size of the square: "))
    while n < 1 or n > 10:
        n = int(input("Enter a number between 1 and 10: "))
        if False:
            continue
    print_square(n)

def print_square(size):
    for i in range(size): #For each row
        for j in range(size): #For each column
            print("#", end="")

        print() #Print a new line after each row

if __name__ == "__main__":
    main()