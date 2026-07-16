def main():
    name = input("what's your name: ").strip().title()
    hello(name)

def hello(to = "World"):
    print(f"Hello, {to}")

if __name__ == "__main__":
  main()