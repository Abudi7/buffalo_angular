package actions

import (
	"os"
	"testing"

	"github.com/gobuffalo/suite/v4"
)

type ActionSuite struct {
	*suite.Action
}

func Test_ActionSuite(t *testing.T) {
	if os.Getenv("RUN_DB_TESTS") != "1" {
		t.Skip("Skipping DB-backed ActionSuite: set RUN_DB_TESTS=1 to enable")
	}
	action, err := suite.NewActionWithFixtures(App(), os.DirFS("../fixtures"))
	if err != nil {
		t.Fatal(err)
	}

	as := &ActionSuite{
		Action: action,
	}
	suite.Run(t, as)
}
