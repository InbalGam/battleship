import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Root from './Components/Root';
import Home from "./Components/Home";
import Login from "./Components/Login";

function App() {

  const router = createBrowserRouter(createRoutesFromElements(
    <Route path='/' >
      <Route exact path="/" element={<Home />} />
      <Route path='/' element={ <Root /> } >
      </Route>
      <Route path='login' element={ <Login/> } />
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
