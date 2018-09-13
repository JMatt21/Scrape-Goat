# Scrape-Goat

Scrape goat is an app that allows users to scrape for articles, comment on them, and also save them.
Because of the way the database is set up, everyone controls the same user. 
So everyone can delete any comment and save/un-save any article.

This app uses Mongodb/Mongoose to store data on articles and comments.

Articles have a title, a url, a summary, the id's of comments on them, and their own id.

UserComments aka. comments have text and an id.
