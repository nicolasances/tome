# Tome Architecture

Tome is based on a **microservices** architecture. 

## Services 

- `tome` - The Progressive Web App. That is the front-end of Tome. Tome has currently two main distinct macro-capabilities: 
    1. `Tome Topics` - a part of the app focused on allowing the user to upload topics (typically notes from books read) and generate practices and challenges to increase the memorization of those topics. 
    2. `Language Learning` - a part of the app focused on helping the user getting through language learning modules, similar to apps like Duolingo.
- `tome-ms-language` - BFF for Tome Language Learning running. Contains: 
    - All logic related to modules (CRUD, practices, tests) and CEFR levels
    - All logic related to tracking user progress in learning a language
- `tome-ms-topics` - Topics management for Tome Topics
- `tome-ms-practice` - Management of user practices for Tome Topics
- `tome-ms-challenges` - Management of Challenges for Tome Topics

**Split of responsibilities**: 
- Anything that is Language Learning related is so far contained either in `tome` or `tome-ms-language`. 
- Anything that is related to Tome Topics is in `tome` and the other services.

**Type of services**: 
| Service            | Type |
| ------------------ | ---- | 
| `tome`             | PWA built in React | 
| `tome-ms-language` | Backend Microservice | 
| `tome-ms-topics`   | Backend Microservice |  
| `tome-ms-practice` | Backend Microservice |  
| `tome-ms-challenges` | Backend Microservice |  

## Backend Microservices Technology Stack

All backend microservices: 
- Are built in either NodeJS or Python 
- Are deployed as Containers
- Expose REST APIs


## Databases 

All data is stored in MongoDB. 
Each backend microservice has its own database on Mongo with a variable set of collections.