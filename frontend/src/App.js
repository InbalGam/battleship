import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Root from './Components/Root';
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Logout from "./Components/Logout";
import BoardGame from "./Components/BoardGame";
import Games from "./Components/Games";
import Profile from "./Components/Profile";
import Game from "./Components/Game";
import Error from "./Components/Error";
import styles from './App.css';


function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' >
      <Route exact path="/" element={<Home />} />
      <Route path='/' element={ <Root /> } >
        <Route path='games' element={ <Games/> } />
        <Route path='games/:game_id' element={ <Game/> } />
        <Route path='profile' element={ <Profile/> } />
      </Route>
      <Route path='login' element={ <Login/> } />
      <Route path='register' element={ <Register/> } />
      <Route path='logout' element={ <Logout/> } />
      <Route path='error' element={ <Error/> } />
    </Route>
  ));


  return (
    <div className="App">
      <header className="App-header">
      </header>
      <body className="App_body" >
        <RouterProvider router={ router } />
      </body>
    </div>
  );
}

export default App;
