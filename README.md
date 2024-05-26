Project Update

Finishing all tasks on time
Still need to implement sorting and searching
Writing unit tests and fixing bugs can take a long time as expected
Finished user functionality early on because it was necessary for testing card collections
I may want to combine some mongodb commands into one, once I finalize the functionality for different functions, 
but that might cause problems for sending different error status codes.

1. A description of the scenario your project is operating in.

Previously, I created a front end application that displays graded trading cards from different grading companies, and I would like to create a more robust backend for it using Mongodb and Mongoose instead of Firebase.

2. A description of what problem your project seeks to solve.

I would like to give the backend application more functionality, including searching and more sorting.  Also, I would like for the user to be able to create different collections from their own collection with different themes, like Seattle teams for example.  I would also like to be able to add users, and set user permissions for different collections.  The problem the site overall solves is displaying graded trading cards from different grading companies in one collection and being able to sort and search them in a way you can’t on the websites of grading companies and Instagram.

3. A description of what the technical components of your project will be, including: the routes, the data models, any external data sources you'll use, etc.

I have an external data source that I have been building, which is all of the graded trading cards I own from my collection and my dad’s that have images provided by their grading company.
The data models will be tradingCard, cardCollection, and user.  The routes will be tradingCard for looking up and adding specific cards, cardCollection for looking up and adding card collections, and auth for signing in users, and creating users.

4. Clear and direct call-outs of how you will meet the various project requirements.

Authentication and Authorization
	Users will sign in, and then they will be blocked from viewing or modifying different collections based on their permissions

2 sets of CRUD routes (not counting authentication)
	There will be a tradingCard route and a cardCollection route.  Users will be able to create, update, and delete trading cards and collections based on their permissions.

Indexes for performance and uniqueness when reasonable
	The tradingCard and cardCollection data models will have a unique compound index of grading company and certification number.  Other indices for performance could be player and year.  The cardCollection data model could have a unique compound index of owner username and collection name.

At least one of text search, aggregations, and lookups
	There could be a text search for tradingCard for a keyword across all fields and/or for specific fields like player and year, and also a text search for collection name, and collections or cards owned by a user.  Aggregations could include counts for number of cards by player, brand and year, and total number of cards a user owns.  Also, there could be stats for cards across all collections.  A lookup would be retrieving all of the card data for one card collection, where the cardCollection only has the object IDs for all the cards included in the collection.


5. A timeline for what project components you plan to complete, week by week, for the remainder of the class.

May 7 - May 14

Work on project proposal

May 14 - May 21

Setup project with MongoDB and railway
Write data models and populate database for project
Get by grading company and certification compound index function
Write unit tests

May 21 - May 28

Proof of concept
Create user and login/logout functions, and user permissions
CRUD card collection functions
CRUD card functions
Write unit tests

May 28 - June 9

Sorting and searching functions for cards and collections
Write unit tests
Testing
Bug fixing