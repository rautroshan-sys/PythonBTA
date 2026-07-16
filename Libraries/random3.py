import random

cards = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King']
random.shuffle(cards)
for card in cards:
    print(card)