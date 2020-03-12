# Trend-Buddy
Web-based application to track IT technology trends based on job postings. 

Note: This application relies on a custom built Java HTTP proxy to resolve CORS issues when connecting with external jobs API. This code is currently not included.

To Deploy Site and Functions: firebase deploy  
To Deploy Site Only: firebase deploy --only hosting  
To Deploy Functions Only: firebase deploy --only functions  
To Deploy Db Rules Only: firebase deploy --only firestore:rules  

To Run Site: http-server public  
To Run Functions:  
set GOOGLE_APPLICATION_CREDENTIALS=C:\projects\Trend-Buddy\functions\trend-buddy-firebase-adminsdk-ymhg3-c65d28fe1d.json
firebase emulators:start --only functions  
http://localhost:5001/trend-buddy/us-central1/updateAllTrends  
