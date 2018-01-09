import React, {Component} from 'react';
var Table = require('antd/lib/table');
require('antd/dist/antd.css');
import axios from 'axios';
import config from '../config.js'
import ResponseAnalyse from './ResponseAnalyse'

class ResponseManage extends Component{
  constructor(){
    super();
    this.state = {userList:undefined,response: undefined}
  }

  componentDidMount(){
    //make api call load data to state
    this.serviceCaller();

  }

  handleChange = (pagination,filter, sorter) => {
      this.setState({
        sortedInfo: sorter,
      });
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

    axios.get(`${config.rootUrl}/responses`,headers)
          .then(function (response) {
            if(response.data){
              this.setState({userList: response.data.questions})
            }
            else{
                this.setState({err : response.data.status})
            }
          }.bind(this))
          .catch(function (error) {
              // this.setState({err : response.data.status})
            console.log(error);
          });


          axios.get(`${config.rootUrl}/showQuestions`,headers)
                .then(function (response) {
                  if(response.data){
                    this.setState({questionslist: response.data.questions})
                  }
                }.bind(this))
                .catch(function (error) {
                    // this.setState({err : response.data.status})
                  console.log(error);
                });
  }


   columns = [{
      title: 'username',
      dataIndex: 'username',
      key: 'username',
    }]

  userClick = (record)=>{
    // api call for selected User
    this.setState({response: record.responses})
  }


  render(){
    return(
            <div>
              {(this.state.userList)?<div>
                    <Table columns={this.columns} onRowClick={(record) => {this.userClick(record)}} dataSource={this.state.userList} rowKey="username" size="small" />
                  </div>:"Fetching users ..."}
              {(this.state.response)?<div><ResponseAnalyse response={this.state.response} questions={this.state.questionslist}/></div>:""}
            </div>
    );
  }
}


export default ResponseManage;
