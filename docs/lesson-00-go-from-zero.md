# Starting from zero

I wrote this when I had no idea how Go worked. If you're in the same spot, start here.

## First thing — just run something

```powershell
go run ./examples/01-run
```

You should see `Hello, MailForge!`. That's it. You just ran a Go program.

Open `examples/01-run/main.go` and you'll see three things:

```go
package main    // this file is a runnable program

import "fmt"    // fmt handles printing

func main() {   // execution starts here
    fmt.Println("Hello, MailForge!")
}
```

Every executable Go program has exactly one `package main` and one `func main()`. That's the entry point. Everything else flows from there.

## Variables

```powershell
go run ./examples/02-variables
```

Two ways to declare a variable:

```go
name := "MailForge"        // short, inferred type, only inside functions
var port int = 8080        // explicit, can be at package level
```

You'll see `:=` everywhere in this codebase. It's just the shorter form.

## Functions

```powershell
go run ./examples/03-functions
```

```go
func greet(name string) string {
    return "Hello, " + name
}
```

Go functions can return multiple values. This is how errors work:

```go
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, errors.New("cannot divide by zero")
    }
    return a / b, nil
}
```

You'll see `(value, error)` return signatures everywhere. Always check the error.

## Structs

```powershell
go run ./examples/04-structs
```

A struct is a custom type that groups related data:

```go
type Campaign struct {
    Name    string
    Subject string
}
```

You can attach methods to structs:

```go
func (c Campaign) Summary() string {
    return c.Name + " | " + c.Subject
}
```

This is basically the same `Campaign` that lives in the real `campaign-service`. The concept doesn't change — it just gets more fields and more methods.

## A small challenge

Make `examples/05-challenge/main.go` with this:

1. A `User` struct with `Name` and `Email` fields
2. A method `Greet()` that returns `"Hey, <Name>!"`
3. A function `isValidEmail(email string) bool` that returns true if the email contains `@`

Run it with `go run ./examples/05-challenge`. If it prints something sensible you're ready to look at the actual service code.

## Where to go from here

Once the struct example clicks, open `services/campaign-service/internal/domain/campaign.go`. It's the same idea — a struct with fields and methods — just wired into a real system.

The jump from "hello world" to "microservice" is mostly just more files doing the same things you already understand.
