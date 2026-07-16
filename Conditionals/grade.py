score = int(input("Enter your score: "))

if score < 0 or score > 100:
    print("Invalid score. Please enter a score between 0 and 100.")
    score = int(input("Enter your score: "))

elif score >= 90 and score <= 100:
    print("You got an A!")

elif score >= 80 and score < 90:
    print("You got a B!")

elif score >= 70 and score < 80:
    print("You got a C!")

elif score >= 60 and score < 70:
    print("You got a D!")
    
else:
    print("You got an F!")