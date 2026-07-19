chars = []

with open("char.csv") as file:
    for line in file:
        
        name, character = line.strip().split(",")
        char = {"name": name, "character": character}
        chars.append(char)

def get_name(char):
    return char["name"]

for char in sorted(chars, key=get_name):
    print(f"{char['name']} is {char['character']}")