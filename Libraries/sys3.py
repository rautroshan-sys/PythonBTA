import sys

if len(sys.argv) < 2:
    sys.exit("Too few arguments")

for arg in sys.argv[1:]: #[1:] means all arguments except the first one, which is the script name

#[1:-1] means all arguments except the first and last ones

    print('Hello, my name is', arg)