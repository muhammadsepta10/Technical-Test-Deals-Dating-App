# Dating App Backend System - RESTful API

## Overview
This is the backend system for a Dating App similar to Tinder/Bumble. It includes functionalities for user signup, login, profile swiping, and premium features. The service is built using **TypeScript** and follows RESTful conventions.

## Features
- **Sign Up & Login**: Users can register and log in to the app.
- **Swipe Feature**(coming soon): Users can swipe left (pass) or right (like) on profiles. Each user has a limit of 10 swipes per day.
- **Profile Uniqueness**(coming soon): No profile can appear more than once in the same day.
- **Premium Packages**(coming soon): Users can purchase premium packages to unlock additional features like unlimited swipes or verified badges.

## Technologies Used
- **Backend**: Node.js (TypeScript)
- **Database**: PostgreSQL,Redis,MongoDb
- **Authentication**: crypto aes-256-cbc
- **Testing**: Jest (Unit and Integration Tests)

## Installation & Setup

### Prerequisites
- Node.js >= 14
- PostgreSQL >= 12
- Redis
- MongoDb

### Steps to Run Locally

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up the environment variables:
    Create a `.env` file in the root directory and add the following:
    ```env
    NODE_ENV=${NODE_ENV}
    APP_PORT=YOUR PORT
    APP_VERSION=APP VERSION
    NAME_PROGRAM="Dating App"
    CRYPTO_SECRET=RANDOM SECRET
    TOKEN_FIREBASE=token from firebase
    BASE_URL=domain of this apps, like https://delsdate.com
    WEB_BASE_URL=-
    
    #PROJECT DB CONFIG
    PROJECT_DB_HOST=host of the db(localhost)
    PROJECT_DB_USER=user of the db(postgres)
    PROJECT_DB_PASS=password of the db(password)
    PROJECT_DB_NAME=deals-dating-app
    PROJECT_DB_PORT=port of the db(5432)
    PROJECT_DB_TYPE=postgres
    
    LOG_DB_URL=for log ("mongodb://localhost:27017/log")
    
    HOST_REDIS=for cache (localhost)
    
    #EMAIL
    MAIL_USER=-
    MAIL_PASS=-
    
    #DEBUG MODE
    DEBUG=on
    ```

4. migrate the database:
    ```bash
    npm run typeorm:generate
    npm run typeorm:run
    ```

5. Start the server(dev):
    ```bash
    npm run start:dev
    ```
6. Start the server(production):
    ```bash
    npm run build
    npm run start
    ```

### Testing

1. To run unit and integration tests:
    ```bash
    npm run test
    ```

### Other feature

- Cache
- Logging
- email send
- firebase notification

