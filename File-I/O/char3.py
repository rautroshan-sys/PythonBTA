chars = []

with open("char.csv") as file:
    for line in file:
        
        name, character = line.strip().split(",")
        char = {"name": name, "character": character}
        chars.append(char)

for char in sorted(chars, key=lambda x: x['name']):
    print(f"{char['name']} is {char['character']}")