import React, {Component} from 'react';
import Login from './Login.js'
import Layout from './Layout.js'
import axios from 'axios';
import config from '../config.js'
import qs from 'qs';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';


class App2 extends Component{

  constructor(){
    super()
    this.state = {loggedIn:false}
  }

  loginClicked=(username,password)=>{

        let data = {}
         data["username"] = username
         data["password"] =  password
        // let query = `?username=${username}&password=${password}`

        let headers = {
               'Content-Type': 'application/x-www-form-urlencoded',
           }


        axios.post(`${config.rootUrl}/adminlogin`,qs.stringify(data),  headers)
              .then(function (response) {
                if(response.data.success){
                  window.sessionStorage.setItem("token", response.data.token);
                  window.sessionStorage.setItem("adminRole", (response.data.adminRole)?response.data.adminRole:false);
                  this.setState({loggedIn:true, token: `${response.data.token}`})}
                else{
                    this.setState({err : response.data.error})
                }
              }.bind(this))
              .catch(function (error) {
                console.log(error);
              });
  }

  logoutClicked=()=>{
    //make api call
    window.sessionStorage.removeItem("token");
    window.sessionStorage.removeItem("adminRole");
    this.setState({loggedIn:false})
  }

  componentWillUnMount(){
    // this.setState({loggedIn: false})
  }

  componentWillMount(){

  }


  loginScreen = ()=>{
    return (
          <div className="no-print">
              <Navbar color="faded" light expand="md">
                <NavbarBrand>Survey Manager</NavbarBrand>
              </Navbar>
              <Login loginClicked = {this.loginClicked}/>
          </div>
        );
  }

  render(){
    return(
      <div>
        {(!this.state.loggedIn && !window.sessionStorage.getItem("token"))?this.loginScreen():<Layout token = {this.state.token} logoutClicked = {this.logoutClicked}/>}
      </div>
    );
  }
}

export default App2;
