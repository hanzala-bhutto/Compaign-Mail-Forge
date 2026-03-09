package main

import "fmt"

func greet(name string) string {
	return "Hello, " + name
}

func main() {
	fmt.Println(greet("MailForge Builder"))

	number := 5
	if number%2 == 0 {
		fmt.Println(number, "is even")
	} else {
		fmt.Println(number, "is odd")
	}

	for i := 1; i <= 3; i++ {
		fmt.Println("Loop count:", i)
	}
}
