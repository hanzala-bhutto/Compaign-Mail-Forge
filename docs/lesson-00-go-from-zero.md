# Lesson 0: Go From Absolute Zero

This lesson assumes you know nothing about Go.

Goal for today:
- Run one Go file
- Understand what `package main` and `func main()` mean
- Learn variables, functions, if, for, and structs at a basic level

## 1) Run your first Go program

From repo root:

```powershell
go run ./examples/01-hello
```

You should see: `Hello, MailForge!`

## 2) Smallest program explained

Open `examples/01-hello/main.go`.

- `package main`: this file is an executable app
- `import "fmt"`: use the print library
- `func main()`: program starts here

## 3) Variables and types

Run:

```powershell
go run ./examples/02-variables
```

Learn:
- `:=` creates a variable
- `var` also creates variables
- basic types: `string`, `int`, `bool`

## 4) Functions, if, and for loop

Run:

```powershell
go run ./examples/03-functions
```

Learn:
- how to define a function
- how `if` works
- Go's single loop: `for`

## 5) Structs (very important for backend)

Run:

```powershell
go run ./examples/04-structs
```

Learn:
- struct = custom data type
- fields and methods

## 6) Tiny challenge (5 minutes)

Create `examples/05-challenge/main.go` and do this:
1. Make a `User` struct with `Name` and `Email`
2. Print: `Welcome <Name>`
3. Add function `isValidEmail(email string) bool` that checks `@`

## 7) What we do next (Lesson 1)

After this lesson, we connect basics to your backend:
- Build one simple HTTP endpoint: `GET /hello`
- Return JSON
- Explain every line slowly

If anything is unclear, copy one line and ask: "Explain this like I am 10." We will do exactly that.
