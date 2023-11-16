# Battleship Game

### Developed by - Inbal Gamliel

I Created the classic Battleship game for users to challenge each other in two dimensions: 10x10 or 20x20.
Players strategically place ships, taking turns for shots, with a successful hit granting an extra turn.
[Battleship game web app](https://battleship-ysnn.onrender.com/).
[Live preview of the game](https://bit.ly/3rzyjF9).

**Login page**
![game login page](/game_images/img1.png)

**Sign up page**
![game register page](/game_images/img2.png)
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
![profile page](/game_images/img3.png)

### Main features - Frontend
I used **Material UI Grid** in order to place the components on the browser.
For example- I used it for the ship placeing phase, where each player places his ships on his board. In addition, I used it in the game phase where each player is shown both boards- his own and the opponent board.

**Game component**
The game component is the main component for the game phase.
This component is in charge on rendering the relevant components according to the state of the game.

**Board game**
This is the main component of the frontend.
This component represents the board of the game, thus it is used in other components where the board is needed.
In order to create a board of certain size (the game can be either 10X10 or 20X20), I rendered a simple div element by the chosen dimension of the game.
If a player wants to place a ship on the board, those divs will be colored accordingly. In order to represent the placed ship.
Once the game started and a player tries to hit an opponent's ship- if that cell contained a ship it will be shown by a blue color and a red X on top of it. If there wasn't a ship in that cell the cell will only contain a red X.
![example of a game session](/game_images/img5.png)

**Ship placing phase**
In this phase each player places his ships on his board.
The player chooses what size ship hhe wants to place, this was done using Material UI Toggle Button.
Once a ship was placed it will be removed from the 'Remaining ships' list and it will move to the 'Placed ships' list. 
If a player wants to change a ship's location he can press on the ship size under the 'Placed ships' list, it will be removed from that list and go back to the 'Remaining ships' list where he can choose it again and assign a different location.

If a player tried to place a ship againt the rules, he will get an alert regarding why the ship cannot be placed. These checks are done on the backend side.
![ship placing phase](/game_images/img4.png)


**Game card**
Players can see the game progress in the Home page under 'Ongoing games'.
Each game is represented by a card with the following information-
The opponent name, How many hits the player made and how many bombed ships the player has indured.
![game cards](/game_images/img6.png)

**Game chat**
During the game the players can use the chat in order to communicate.
![game chat](/game_images/img7.png)