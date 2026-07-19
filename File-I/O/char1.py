chars = []

with open("char.csv") as file:
    for line in file:
        name, character = line.strip().split(",")
        chars.append(f"{name} is {character}")

for char in sorted(chars):
    print(char)