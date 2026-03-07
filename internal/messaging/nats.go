package messaging

import (
	"context"
	"errors"

	"github.com/nats-io/nats.go"
)

type Publisher interface {
	Publish(subject string, payload []byte) error
}

type Subscriber interface {
	Subscribe(subject string, handler func([]byte) error) (func() error, error)
}

type NATSClient struct {
	conn *nats.Conn
}

func NewNATSClient(url string) (*NATSClient, error) {
	conn, err := nats.Connect(url)
	if err != nil {
		return nil, err
	}
	return &NATSClient{conn: conn}, nil
}

func (n *NATSClient) Publish(subject string, payload []byte) error {
	if n.conn == nil {
		return errors.New("nats connection is nil")
	}
	return n.conn.Publish(subject, payload)
}

func (n *NATSClient) Subscribe(subject string, handler func([]byte) error) (func() error, error) {
	if n.conn == nil {
		return nil, errors.New("nats connection is nil")
	}
	sub, err := n.conn.Subscribe(subject, func(msg *nats.Msg) {
		_ = handler(msg.Data)
	})
	if err != nil {
		return nil, err
	}
	return sub.Unsubscribe, nil
}

func (n *NATSClient) Drain(ctx context.Context) error {
	if n.conn == nil {
		return nil
	}
	done := make(chan struct{})
	go func() {
		_ = n.conn.Drain()
		close(done)
	}()

	select {
	case <-ctx.Done():
		return ctx.Err()
	case <-done:
		return nil
	}
}
