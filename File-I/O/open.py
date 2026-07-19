name = input("What is your name? ")

file = open("names.txt", "a")
file.write(name + "\n")
file.close()