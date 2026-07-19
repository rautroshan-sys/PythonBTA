with open("char.csv") as file:
    for line in file:
        name, character = line.strip().split(",")
        print(f"{name} is {character}")