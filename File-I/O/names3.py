names = []

with open("names.txt") as file:
    for line in file:
        names.append(line.strip())

for name in sorted(names):
    print(f"hello, {name}")

"""
for name in sorted(names, reverse=True): #for reverse order
    print(f"hello, {name}")
"""