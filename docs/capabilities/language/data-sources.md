# Data Sources in Language Learning

## Core Idea

Tome allows the user to setup **"Data Sources"**. <br>

Instead of asking users to type vocabulary manually, let them connect learning materials:

- Google Docs from teacher
- PDFs from class
- Word docs
- Homework sheets
- Reading material
- Chat transcripts
- Websites later
- Audio transcripts later

Tome Language Learning has then become a: 

> “Everything I study automatically turns into vocabulary.”

The User, in the Tome interface, has then the possibility to: 
- **Add a Data Source**, *noting that only specific data sources are supported, as they require some type of implementation (integration) in the backend.*. 
- **Fetch & Process the content**. This is user-triggered from the app: it triggers the fetching of the information in the Data Source and the processing, which generates (updates) the knowledge base (e.g. Vocabulary) that stands behind Tome. That processing is usually LLM-driven, as it requires NLP capabilities. 

## Supported Data Source Types
### Google Docs
To support Google Docs, the User needs to **share a document with the service account of the Cloud Run service** that will fetch the information. <br>
That allows the Cloud Run service to access the data server-to-server and download the content. 

