# Battleship Game

### Developed by - Inbal Gamliel

I Created the classic Battleship game for users to challenge each other in two dimensions: 10x10 or 20x20.
Players strategically place ships, taking turns for shots, with a successful hit granting an extra turn.
[Live preview](https://bit.ly/3rzyjF9) of the game.


### Main features - Backend
**Players can choose how to sign up for the game**
- Regular registration where they use a valid email and create their own password and nickname.
- Google sign up where they use their google account to register.

If a player chooses to sign up using his Google account the following will occur-
1. His email will be set as the username and his google display name will be set as the nickname.
2. His password will not be saved in the DB.
3. His profile id will be saved under a specific table (Federated Credentials) in the DB that represents a Google sign up.

If the player signed up using Google, the next time he will log in, the existing user record will be found via its relation to the Google account (using his Google profile id).


**Players can upload their profile picture**
I used the Multer middleware in order to enable players the option of uploading a picture as their profile image. Multer is a Node.js middleware for handling multipart/form-data, uploading files such as images.

When a player wants to upload a profile picture he will click on an edit icon near his profile nickname (default option for those without a picture).
The edit button will open up a file upload window, when choosing the picture a copy of it will be created in an 'images' folder in the backend side and the picture path and information will be saved in the DB in relation to the player information.


### Main features - Frontend
