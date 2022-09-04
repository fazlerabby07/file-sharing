# File Sharing
#### Config Files

Configurations are in the `.env.copy` file. Need to create `.env` file from `.env.copy`.
##### Command list: 
Use `npm i` to install all packages

##### Run Project
Use `npm start` to run the project locally with port that have given in .env file.

##### Run Project Unit and Integration test
Use `npm test` to run unit test
Use `npm run test:e2e` for integration test

# APIs
### Upload files
`url`: `POST /files`

#### Request
upload file will be in multipart/form-data and key name is `file`
##### Response
```json
{
    "error": false,
    "data": {
        "publicKey": "c578d31e-b6d2-40ca-9d6f-5c6d435adf69",
        "privateKey": "68bbf5f1-f3cb-43a7-9ef2-8dfb384f1862"
    },
    "message": "file created successfully",
    "token": null
}
```

### Upload files
`url`: `GET /files/:publicKey`

##### Response
We will get file that will upload by owner

### Upload files
`url`: `DELETE /files/:privateKey`

##### Response
```json
{
    "error": false,
    "data": {
        "message": "file delete successfully."
    },
    "message": null,
    "token": null
}
```

# Cronjob
Cron job will run every minute to check if there are any inactive. Period of inactivity can be configure in .env file. It will in hour.