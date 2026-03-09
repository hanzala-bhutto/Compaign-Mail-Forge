package main

import "fmt"

type Campaign struct {
	Name    string
	Subject string
}

func (c Campaign) Summary() string {
	return c.Name + " | " + c.Subject
}

func main() {
	c := Campaign{
		Name:    "Launch",
		Subject: "Welcome to MailForge",
	}

	fmt.Println("Campaign:", c.Summary())
}
