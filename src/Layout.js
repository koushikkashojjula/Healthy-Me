import React, {Component} from 'react';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import UserManage from './UserManage.js'
import ResponseManage from './ResponseManage.js'
import MessegeManage from './MessegeManage.js'
import config from '../config.js'

class Layout extends Component{

  constructor(){
    super()
    this.adminRole = (window.sessionStorage.adminRole == "false")?false:true;
    this.state = {showUsers: false}
  }


  navBar = ()=>{
    return <Navbar color="faded" light expand="md" id="react-no-print" >
            <NavbarBrand>Survey Manager</NavbarBrand>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink onClick = {()=>this.setState(prevState=>({showUsers: !prevState.showUsers}))}>{(this.state.showUsers)?"Manage Survey": (this.adminRole)?"Manage Coordinators":"Manage Patients"}</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink onClick = {()=>{this.props.logoutClicked()}}>Logout</NavLink>
                </NavItem>
              </Nav>
          </Navbar>
  }

  render(){
    return(
        <div>
          {this.navBar()}
          {(this.state.showUsers)?<UserManage token = {this.props.token} adminRole={this.adminRole}/>:<MessegeManage token = {this.props.token} />}
        </div>
    );
  }
}

export default Layout
