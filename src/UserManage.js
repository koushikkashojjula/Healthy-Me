import React, {Component} from 'react';
import config from '../config.js'
var Table = require('antd/lib/table');
require('antd/dist/antd.css');
import axios from 'axios'
import qs from 'qs';
import AdduserForm from './UserAdduser'

class UserManage extends Component{
  constructor(){
    super();
    this.state = {name:"",username:"", password:"", userList:undefined,sortedInfo: null,sortedInfo: {order: 'descend',columnKey: 'username'}}
  }


  onEValueChange = (event)=>{
      this.setState({username: event.target.value})
  }

  onPValueChange = (event)=>{
      this.setState({password: event.target.value})
  }

  addUser = ()=>{
    if(this.state.username && this.state.password){
      this.postUser(this.state.name, this.state.username,this.state.password)
    }
  }

  postUser = (name,username,password)=>{

    let data = {}
     data["username"] = username
     data["name"] = name
     data["password"] =  password
     data["iscoordinator"] = (this.props.adminRole)?true:false;
     data["role"] = (this.props.adminRole)?"admin":"user";
    let token = window.sessionStorage.getItem("token");

    var headers = {
       headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            "username": "admin",
            'token': token
        }
      }

    axios.post(`${config.rootUrl}/addUser`,qs.stringify(data),headers)
          .then(function (response) {
            if(response.data.success){
              this.serviceCaller()
              // this.setState({username: "", password: "", err : ""})
            }
            else{
                this.setState({err : response.data.status})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
  }

  componentDidMount(){
      this.serviceCaller()
  }

  componentWillUnMount(){
    this.setState({err: ""})
  }

  serviceCaller = ()=>{
    let token = window.sessionStorage.getItem("token");

    var headers = {
       headers : {
            'Content-Type': 'application/x-www-form-urlencoded',
            "username": "admin",
            'token': token
        }
      }

    axios.get(`${config.rootUrl}/users`,headers)
          .then(function (response) {
            if(response.data){
              if(this.props.adminRole)
                this.setState({userList: response.data.filter(user=>user.iscoordinator)})
              else{
                this.setState({userList: response.data.filter(user=>!user.iscoordinator)})
              }
            }
            else{
                this.setState({err : response.data.status})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
  }

  userAdding2 = ()=>{
      return (
        <div style={{textAlign: "center"}}>
        <input placeholder="Name" type="text" value = {this.state.name} onChange = {(event)=>this.setState({name:event.target.value})} />
        <input placeholder="username" type="text" value = {this.state.username} onChange = {this.onEValueChange} />
        <input placeholder="password" style={{marginLeft: 5}} type="password" value = {this.state.password} onChange = {this.onPValueChange} />
        <button style={{marginLeft: 10}} onClick = {this.addUser}> add user </button>
        </div>
      );
  }

  userAdding=()=>{
    let {adminRole} = this.props;
      return <AdduserForm postUser = {this.postUser} adminRole={adminRole}/>
  }

  render(){
    const columns = [{
       title: 'username',
       dataIndex: 'username',
       key: 'username',
       sorter: (a, b) => a.username.length - b.username.length,
       defaultSortOrder: 'descend',
     },{
        title: 'name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.length - b.name.length,
      }]

    return(
            <div style={{paddingTop:30}}>
              {this.userAdding()}
              {(this.state.err)?<div>{this.state.err}</div>:""}
              {(this.state.userList)?<div style={{marginTop:30, width:400,marginLeft:"38%"}}>
                    <Table columns={columns} dataSource={this.state.userList} rowKey="username" size = "small"  />
                    </div>:<div style={{textAlign: "center", marginTop: "20%"}}>Add users ...</div>}
            </div>
    );
  }
}


export default UserManage;
