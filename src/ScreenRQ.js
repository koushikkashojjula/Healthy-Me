import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
import qs from 'qs';
import { Menu, Dropdown, Icon, message } from 'antd';
import style from '../styles/dropdownstyle.css'
import ResponseAnalyse from './ResponseAnalyse';
var Table = require('antd/lib/table');
require('antd/dist/antd.css');


class ScreenRQ extends Component{
  constructor(){
    super();
    this.state={messages:undefined,selectedMenuUser: undefined}
  }
  getInfoByUser = (username)=>{
    let token = window.sessionStorage.getItem("token");
    var headers = {
       headers : {
            'Content-Type':'application/json',
            'token': token
        }
      }
    axios.get(`${config.rootUrl}/getmessage?username=${username}`,headers)
          .then(function (response) {
            if(response.data.success){
              this.setState({responses: response.data.responses,messages: response.data.message,selectedMenuUser: username})
            }
            else{
                this.setState({err : response.data.error})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
      axios.get(`${config.rootUrl}/getSurveyResponses?username=${username}`,headers)
            .then(function (response) {
              if(response.data.success){
                this.setState({surveyResponses: response.data.surveyresponse,selectedMenuUser: username})
              }
              else{
                  this.setState({err : response.data.error})
              }
            }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
  }

  menuOnClick =  ({key})=> {
    this.getInfoByUser(this.props.users[key].username)
  };

  assignMenu = ()=> {
    const menuItemGetter = ()=>{
      return this.props.users.map((user,id)=>{
          return <Menu.Item key={id}>{user.username}</Menu.Item>
      })
    }
    return   <Menu onClick={this.menuOnClick}>
                {menuItemGetter()}
             </Menu>
  }

  dropDownMenu = ()=>{
    return  <Dropdown overlay={this.assignMenu()}>
                <div className="dropdown" style={{ marginTop: 20,marginLeft: 550,color: "antiquewhite"}}>
                  {(this.state.selectedMenuUser)?this.state.selectedMenuUser:"select user"}
                 </div>
            </Dropdown>
  }


  surveyResponseList=()=>{
    let user = this.props.users[this.state.selectedMenuUser];
    let returnArray = [];
    this.state.surveyResponses.map(sur=>{
        sur.responses.map(que=>{
          let obj = {};
          obj['sname'] = sur.surveyname;
          obj['qname'] = que.name;
          obj['response'] = (que.response)?que.response.toString():" no response"
          obj['key'] = sur.sid+ que.qid
          returnArray.push(obj)
        })
    })
    const columns = [{
       title: 'Survery Title',
       dataIndex: 'sname',
       key: 'sname',
       defaultSortOrder: 'descend',
       sorter: (a, b) => a.sname.length - b.sname.length,
     },{
        title: 'Question',
        dataIndex: 'qname',
        key: 'qname',
        sorter: (a, b) => a.qname.length - b.qname.length,
    },{
        title: 'Response',
        dataIndex: 'response',
        key: 'response',
        sorter: (a, b) => a.response.length - b.response.length,
      }]
      return <Table columns={columns} dataSource={returnArray} rowKey="key"   />
  }

  responseList=()=>{
    let user = this.props.users[this.state.selectedMenuUser];
    let qResp = {};
    let returnArray = []
    this.state.messages.map(msg=>{
        qResp[msg.mid] = {}
        qResp[msg.mid]["isquestion"] = (msg.questiontype == 2)?"true":"false";
        qResp[msg.mid]["isresponded"] = "false"
        qResp[msg.mid]["message"] = msg.message
        qResp[msg.mid]["response"] = "no response"
        qResp[msg.mid]["key"] = msg.mid;

        this.state.responses.map(resp=>{
          if(qResp[resp.qid]){
            qResp[resp.qid]["isresponded"] = "true"
            qResp[resp.qid]["response"] = resp.responses[0]
          }
        })

        returnArray.push(qResp[msg.mid])
    })

     const columns = [{
        title: 'Messsage Content',
        dataIndex: 'message',
        key: 'message',
        defaultSortOrder: 'descend',
        sorter: (a, b) => a.message.length - b.message.length,
      },{
         title: 'Is Question',
         dataIndex: 'isquestion',
         key: 'isquestion',
         sorter: (a, b) => a.isquestion.length - b.isquestion.length,
     },{
        title: 'Responded',
        dataIndex: 'isresponded',
        key: 'isresponded',
        sorter: (a, b) => a.isresponded.length - b.isresponded.length,
      },{
         title: 'Response',
         dataIndex: 'response',
         key: 'response',
         sorter: (a, b) => a.response.length - b.response.length,
       }]
       return <Table columns={columns} dataSource={returnArray} rowKey="key"   />

  }

  printPage=()=>{
    window.print();
  }

  render(){
    return(
      <div style={{marginLeft: "15%"}}>
        <div key="0">{this.dropDownMenu()} <button className="rqButton"onClick={this.printPage}>Print</button></div>
        {(this.state.selectedMenuUser)?(
          <div>
            {(this.state.responses)?<div style={{marginTop:50,width:847,marginLeft:"35%"}}><ul>{this.responseList()}</ul></div>:""}
            {(this.state.surveyResponses)?<div style={{marginTop:50,width:847,marginLeft:"35%"}}><ul>{this.surveyResponseList()}</ul></div>:""}
          </div>
        ):<div style={{marginTop:50, marginLeft:"75%"}}>Select User</div>}
      </div>
    );
  }
}


export default ScreenRQ;
