import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
import ScreenMQ from './ScreenMQ';
import ScreenCQ from './ScreenCQ';
import ScreenRQ from './ScreenRQ';
import ScreenMS from './ScreenMS';
import ResponseManage from './ResponseManage';

class MessageManage extends Component{
  constructor(){
    super();
    this.state = {screen:"0"}
  }

  componentDidMount(){
    this.serviceCaller();
  }

  serviceCaller = ()=>{
    let token = window.sessionStorage.getItem("token")
    var headers = {
       headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            "username": "admin",
            'token': token
        }
      }
      axios.get(`${config.rootUrl}/users`,headers)
            .then(function (response) {
              if(!response.data.success){
                this.setState({userList: response.data.filter(user=>!user.iscoordinator)})
              }
              else{
                  this.setState({err : response.data.success})
              }
            }.bind(this))
            .catch(function (error) {
                // this.setState({err : response.data.status})
              console.log(error);
            });
  }


  sidebar= ()=>{
    return(
        <div className= "sideBarHead no-print" id="react-no-print">
          <ul className="sideBarUl" onClick = {(event)=>{if(event.target.id!="")this.setState({screen:event.target.id })}} >
            <li className={`sideBarli ${this.state.screen==0?"selected":""}`}  id = {0}> Create Questions </li>
            <li className={`sideBarli ${this.state.screen==3?"selected":""}`} id = {3}> Create Surveys </li>
            <li className={`sideBarli ${this.state.screen==1?"selected":""}`} id = {1}> Manage Questions </li>
            <li className={`sideBarli ${this.state.screen==2?"selected":""}`} id = {2} > Patient Responses </li>
          </ul>
        </div>
    )
  }

  mainScreen=(screen)=>{
    return <div> {screen} </div>
  }

  renderScreen=()=>{
    if(this.state.userList){
      switch (this.state.screen) {
        case "0":
          return  <ScreenCQ users= {this.state.userList} token={this.props.token}/>
          break;
        case "1":
          return <ScreenMQ token={this.props.token} users= {this.state.userList}/>
          break;
        case "2":
          return <ScreenRQ token={this.props.token} users= {this.state.userList}/>
          break;
        case "3":
          return <ScreenMS token={this.props.token} users= {this.state.userList}/>
          break;
      }
    }else{
      return "user list loading"
    }
  }

  render(){
    return(
        <div style={{    display: "-webkit-box", paddingTop:50}}>
          {this.sidebar()}
          {this.renderScreen()}
        </div>
    )
  }

}

export default MessageManage
