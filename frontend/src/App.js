import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Root from './Components/Root';
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Logout from "./Components/Logout";
import BoardGame from "./Components/BoardGame";
import Games from "./Components/Games";
import styles from './App.css';


function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' >
      <Route exact path="/" element={<Home />} />
      <Route path='/' element={ <Root /> } >
        <Route path='board' element={ <BoardGame/> } />
        <Route path='games' element={ <Games/> } />
      </Route>
      <Route path='login' element={ <Login/> } />
      <Route path='register' element={ <Register/> } />
      <Route path='logout' element={ <Logout/> } />
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
