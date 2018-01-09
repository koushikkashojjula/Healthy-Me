import React, {Component} from 'react';
import axios from 'axios';
import config from '../config.js'
import qs from 'qs';
import { Card, Col, Row } from 'antd';
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class ScreenMQ extends Component{
  constructor(){
    super();
    this.state = {}
  }

  componentDidMount(){
    this.dataCaller();
  }

  dataCaller=()=>{
    let token = window.sessionStorage.getItem("token");
    var headers = {
       headers : {
            'Content-Type':'application/json',
            "username": "admin",
            'token': token
        }
      }
    axios.get(`${config.rootUrl}/message`,headers)
          .then(function (response) {
            if(!response.data.success){
              this.setState({messages: response.data.filter(msg=>msg.questiontype!=3),selectedMessage: undefined})
            }
            else{
                this.setState({err : response.data.error})
            }
          }.bind(this))
          .catch(function (error) {
            console.log(error);
          });
  }

 schedule =(msg)=>{
        switch (msg.questionsubtype) {
          case 0:
            return ` Scheduled once a day at ${msg.remind[0]}`
            break;
          case 1:
            return ` Scheduled every hour starting  from ${msg.remind[0]}`
                break;
          case 2:
            return ` Scheduled twice a day  at ${msg.remind[0]} and ${msg.remind[1]}`
                    break;
          default:

        }
  }

  cardScreen=()=>{

    var colScreen =(msg,id)=>{
      if(msg)
      return <Col span={6} key={id}>
                                <Card title={msg.message} className="antCardNormal" bordered={false} onClick={()=>this.cardClick(msg)}>
                                  <p>{(msg.questiontype == 2)?"Question":"Message"}</p>
                                  <p style={{display:"initial"}}>{(msg.questionsubtype != -1)?this.schedule(msg):" This is not a scheduled message"}</p>
                                </Card>
                             </Col>
    }

      var rowGenerator = ()=>{
        let k = 4
        let l = this.state.messages.length/k;
        l = Math.ceil(l)
        let lmin = 0
        let tempArray = []
       while(lmin < l){
          let msg = this.state.messages
            tempArray.push (<Row gutter={16} key={lmin}>
                      {colScreen(msg[k*lmin+0],k*lmin+0)}
                      {colScreen(msg[k*lmin+1],k*lmin+1)}
                      {colScreen(msg[k*lmin+2],k*lmin+2)}
                      {colScreen(msg[k*lmin+3],k*lmin+3)}
                   </Row>);
                   lmin++;
        }
        return tempArray
      }
      return(
        <div style={{ padding: '30px' }}>
        {rowGenerator()}
        </div>
      )
  }

  cardClick=(msg)=>{
      let options =[]
      let users = this.props.users
      let value = []
      let usernames = []
      users.map(user=>{
        let obj = {}
           obj["value"] = user.username;
           obj["label"] = user.username;
           options.push(obj)
      })
      this.props.users.map(usr=>{
          usernames.push(usr.username)
      })
      if(msg.users)
          msg.users.map(user=>{
            if(usernames.includes(user)){
              value.push(user)
            }
          })
    this.setState({selectedMessage: msg, options: options, value : value?value.join():null})
  }

  HiItems = (value)=>{
    this.setState({value:value})
  }

  publishChanges=()=>{
        let token = window.sessionStorage.getItem("token");
        var headers = {
           headers : {
                'Content-Type':'application/json',
                "username": "admin",
                'token': token
            }
          }
        let data = {}
           data["mid"] = this.state.selectedMessage.mid
           data["users"] = this.state.value.split(",")
           data["ispublished"] = true;
           data["publishtime"] = new Date();
        axios.put(`${config.rootUrl}/message`,data,headers)
              .then(function (response) {
                if(response.data.success){
                  this.dataCaller()
                }
                else{
                    this.setState({err : response.data.status})
                }
              }.bind(this))
              .catch(function (error) {
                console.log(error);
              });
  }

  deleteMessage=()=>{
      let token = window.sessionStorage.getItem("token")
      var headers = {
         headers : {
              'Content-Type':'application/json',
              "username": "admin",
              'token': token
          }
        }
      axios.delete(`${config.rootUrl}/message?mid=${this.state.selectedMessage.mid}`,headers)
            .then(function (response) {
              if(response.data.success){
                this.dataCaller()
              }
              else{
                  this.setState({err : response.data.status})
              }
            }.bind(this))
            .catch(function (error) {
              console.log(error);
            });
  }

  messageScreen = (msg)=>{
    var options = [
      { value: 'one', label: 'One' },
      { value: 'two', label: 'Two' }
    ];
    return <div>
              <Card className="antCardBOx" title={msg.message} bordered={false} >
                  <div>
                      <div style={{fontSize:15}}>{(msg.questiontype == 2)?"Question":"Message"}</div>
                      <div style={{textAlign: "right",fontSize:15,marginTop:-25, marginBottom: 15}}>{(msg.questionsubtype != -1)?this.schedule(msg):"This is not a scheduled message"}</div>
                  </div>
                    <Select name="form-field-name"  value={this.state.value} simpleValue= {true}   options={this.state.options}   placeholder= 'Select Patients for this mesasge'  onChange={this.HiItems}  multi={true}   />
                  <div>
                    <button className= "mqButton" onClick={()=>this.publishChanges()}> Publish Changes </button>
                    <button className= "mqButton" style={{marginLeft:30}} onClick={()=>this.deleteMessage()}> Delete </button>
                    <button className= "mqButton" style={{marginLeft:"75%"}} onClick={()=>this.setState({selectedMessage: undefined})}> Cancel </button>
                  </div>
              </Card>
           </div>
  }

  render(){
    return(
      <div style={{width:"100%"}}>
          <div style={{width:"auto", overflow:"auto", maxHeight:500,marginLeft:"15%",marginRight:"2%"}}>
            {(this.state.messages)?this.cardScreen(): "Data is loading...."}
          </div>
          <div style={{width:"auto", overflow:"auto", padding:30,marginLeft:"15%",marginRight:"2%"}}>
            {(this.state.selectedMessage)?this.messageScreen(this.state.selectedMessage): ""}
          </div>
      </div>
    )
  }
}



export default ScreenMQ;
