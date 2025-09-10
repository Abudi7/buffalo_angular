package models

import (
	"time"

	"github.com/gobuffalo/nulls"
	"github.com/gofrs/uuid"
	"github.com/lib/pq"
)

type TimeTrac struct {
	ID           uuid.UUID      `db:"id"         json:"id"`
	UserID       uuid.UUID      `db:"user_id"    json:"-"`
	Project      string         `db:"project"    json:"project"`
	Tags         pq.StringArray `db:"tags"       json:"tags"`
	Note         string         `db:"note"       json:"note"`
	Color        string         `db:"color"      json:"color"`
	LocationLat  nulls.Float64  `db:"location_lat"  json:"location_lat"`
	LocationLng  nulls.Float64  `db:"location_lng"  json:"location_lng"`
	LocationAddr nulls.String   `db:"location_addr" json:"location_addr"`
	PhotoData    nulls.String   `db:"photo_data"    json:"photo_data"`
	StartAt      time.Time      `db:"start_at"   json:"start_at"`
	EndAt        nulls.Time     `db:"end_at"     json:"end_at"`
	CreatedAt    time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at" json:"updated_at"`
}

func (t TimeTrac) TableName() string { return "timetrac" }
