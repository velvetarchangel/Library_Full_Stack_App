import { Component } from "react";
import { Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }
  callAPI() {
    fetch("http://localhost:5001/testAPI")
      .then((res) => res.text())
      .then((res) => this.setState({ apiResponse: res }))
      .catch((err) => err);
  }
  componentWillMount() {
    this.callAPI();
  }

  render() {
    return (
      <div className="App">
        <div>
          <p>Please choose a repository from the list below.</p>
          <ul>
            <li>
              <Router>
                <Routes>
                  <Route path="/login" element={<Login />}>
                    Login
                  </Route>
                  <Route path="/signup" element={<Signup />}>
                    Signup
                  </Route>
                </Routes>
              </Router>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
