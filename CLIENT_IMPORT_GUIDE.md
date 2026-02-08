# Client CSV Import Guide

Use this CSV format to bulk import clients into Servilogics. Columns are comma-separated. Lists (jobTypes, purchases, invoices, workHistory, photos, videos) should use semicolons.

## Recommended columns

- firstName
- lastName
- phone
- email
- address
- city
- state
- country
- zip
- jobTypes
- purchases
- invoices
- workHistory
- lastMaintenanceAt
- nextMaintenanceAt
- notes
- photos
- videos

## Example

```csv
firstName,lastName,phone,email,address,city,state,country,zip,jobTypes,purchases,invoices,workHistory,lastMaintenanceAt,nextMaintenanceAt,notes,photos,videos
Andrea,Gomez,+1-555-2101,andrea@servilogics.com,123 Palm Ave,Miami,FL,USA,33101,preventive-maintenance;air-conditioning,Annual HVAC plan,INV-1001,AC tuneup,2024-01-12,2024-07-12,Prefers morning,https://image.jpg,https://video.mp4
```

## Notes

- Date fields accept ISO format: YYYY-MM-DD
- If a value contains a comma, wrap it in double quotes.
- Empty columns are allowed.
