students = [
    {"name": "Harry", "house": "Gryffindor", "password": "potter"},
    {"name": "Hermione", "house": "Gryffindor", "password": "granger"},
    {"name": "Ron", "house": "Gryffindor", "password": "weasley"},
    {"name": "Draco", "house": "Slytherin", "password": "malfoy"},
    {"name": "Luna", "house": "Ravenclaw", "password": "lovegood"},
    {"name": "Neville", "house": "Gryffindor", "password": "longbottom"}
]

for student in students:
    print(student["name"], student["house"], student["password"], sep = ", ")